import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// API Pública - Auditor Digital con Google PageSpeed

interface ApiKeyValidation {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    planType: string;
    credits: number;
  };
  error?: string;
}

async function validateApiKey(apiKey: string): Promise<ApiKeyValidation> {
  if (!apiKey || !apiKey.startsWith('ntm_')) {
    return { valid: false, error: "Invalid API key format" };
  }

  const user = await db.user.findFirst({
    where: {
      OR: [
        { email: apiKey.replace('ntm_live_', '').replace('ntm_test_', '').replace('_', '@') },
        { id: apiKey.split('_').pop() }
      ]
    },
    select: { id: true, email: true, planType: true, credits: true }
  });

  if (!user) {
    return { valid: false, error: "API key not found" };
  }

  if (user.planType !== 'enterprise' && (user.credits ?? 0) <= 0) {
    return { valid: false, error: "No credits available" };
  }

  return { valid: true, user };
}

async function consumeApiCredit(userId: string, planType: string): Promise<boolean> {
  if (planType === 'enterprise') return true;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  });

  if (!user || (user.credits ?? 0) <= 0) return false;

  await db.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } }
  });

  return true;
}

// Google PageSpeed Insights API
async function runPageSpeed(url: string, strategy: 'mobile' | 'desktop' = 'mobile') {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_PAGESPEED_API_KEY_HERE') {
    return null;
  }

  const params = new URLSearchParams({
    url: url.startsWith('http') ? url : `https://${url}`,
    key: apiKey,
    strategy,
    category: ['performance', 'accessibility', 'best-practices', 'seo'].join('&category=')
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      performance: Math.round((data.categories?.performance?.score || 0) * 100),
      accessibility: Math.round((data.categories?.accessibility?.score || 0) * 100),
      bestPractices: Math.round((data.categories?.['best-practices']?.score || 0) * 100),
      seo: Math.round((data.categories?.seo?.score || 0) * 100),
      coreWebVitals: {
        lcp: data.lighthouseResult?.audits?.['largest-contentful-paint']?.displayValue,
        fid: data.lighthouseResult?.audits?.['max-potential-fid']?.displayValue,
        cls: data.lighthouseResult?.audits?.['cumulative-layout-shift']?.displayValue
      }
    };
  } catch (error) {
    console.error("PageSpeed error:", error);
    return null;
  }
}

// Verificar si un sitio web existe
async function checkWebsite(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url.startsWith('http') ? url : `https://${url}`, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return {
      exists: response.ok,
      status: response.status
    };
  } catch {
    return { exists: false };
  }
}

// GET - Documentación
export async function GET() {
  return NextResponse.json({
    name: "NTM Public API - Auditor",
    version: "1.0.0",
    description: "API para auditoría digital de negocios",
    endpoints: {
      "POST /api/v1/auditor": {
        description: "Realizar auditoría digital completa",
        parameters: {
          businessName: "string (required) - Nombre del negocio",
          website: "string (optional) - URL del sitio web a analizar"
        },
        response: {
          overallScore: "number (0-100)",
          categories: "array de categorías analizadas",
          pageSpeed: "métricas de Google PageSpeed (si hay website)",
          recommendations: "array de recomendaciones"
        }
      }
    },
    authentication: {
      type: "API Key",
      header: "X-API-Key"
    }
  });
}

// POST - Ejecutar auditoría
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("X-API-Key") ||
                   new URL(request.url).searchParams.get("api_key");

    const validation = await validateApiKey(apiKey || '');

    if (!validation.valid || !validation.user) {
      return NextResponse.json({
        error: "Unauthorized",
        message: validation.error || "API key required"
      }, { status: 401 });
    }

    const body = await request.json();
    const { businessName, website } = body;

    if (!businessName) {
      return NextResponse.json({
        error: "Bad Request",
        message: "businessName is required"
      }, { status: 400 });
    }

    // Consumir crédito
    const consumed = await consumeApiCredit(validation.user.id, validation.user.planType);

    if (!consumed) {
      return NextResponse.json({
        error: "Payment Required",
        message: "No credits available"
      }, { status: 402 });
    }

    // Verificar sitio web
    let websiteCheck = null;
    let pageSpeedData = null;

    if (website) {
      websiteCheck = await checkWebsite(website);

      if (websiteCheck?.exists) {
        // Ejecutar PageSpeed en paralelo
        const [mobile, desktop] = await Promise.all([
          runPageSpeed(website, 'mobile'),
          runPageSpeed(website, 'desktop')
        ]);

        pageSpeedData = { mobile, desktop };
      }
    }

    // Calcular score
    let score = 10; // Base
    if (websiteCheck?.exists) score += 30;
    if (pageSpeedData?.mobile?.performance && pageSpeedData.mobile.performance > 50) score += 20;
    if (pageSpeedData?.mobile?.seo && pageSpeedData.mobile.seo > 70) score += 15;
    if (pageSpeedData?.mobile?.accessibility && pageSpeedData.mobile.accessibility > 70) score += 10;
    if (website?.startsWith('https')) score += 15;

    const auditResult = {
      businessName,
      website: website || null,
      overallScore: Math.min(score, 100),
      websiteCheck: websiteCheck ? {
        exists: websiteCheck.exists,
        status: websiteCheck.status,
        hasSSL: website?.startsWith('https') || false
      } : null,
      pageSpeed: pageSpeedData,
      categories: [
        {
          name: "Presencia Web",
          score: websiteCheck?.exists ? 80 : (website ? 30 : 0),
          status: websiteCheck?.exists ? "good" : "bad"
        },
        {
          name: "Rendimiento Móvil",
          score: pageSpeedData?.mobile?.performance || 0,
          status: (pageSpeedData?.mobile?.performance || 0) > 50 ? "good" : "needs_improvement"
        },
        {
          name: "SEO",
          score: pageSpeedData?.mobile?.seo || 0,
          status: (pageSpeedData?.mobile?.seo || 0) > 70 ? "good" : "needs_improvement"
        },
        {
          name: "Accesibilidad",
          score: pageSpeedData?.mobile?.accessibility || 0,
          status: (pageSpeedData?.mobile?.accessibility || 0) > 70 ? "good" : "needs_improvement"
        }
      ],
      recommendations: [
        ...(websiteCheck?.exists ? [] : ["Crear un sitio web profesional"]),
        ...(pageSpeedData?.mobile?.performance && pageSpeedData.mobile.performance < 50 
          ? ["Optimizar velocidad de carga en móvil"] : []),
        ...(pageSpeedData?.mobile?.seo && pageSpeedData.mobile.seo < 70 
          ? ["Mejorar SEO técnico"] : []),
        "Registrar en Google My Business",
        "Crear perfiles en redes sociales"
      ],
      timestamp: new Date().toISOString(),
      dataSource: pageSpeedData ? "Google PageSpeed Insights" : "Verificación HTTP"
    };

    // Guardar en historial
    await db.analysisRequest.create({
      data: {
        userId: validation.user.id,
        toolType: "auditor",
        inputData: JSON.stringify({ businessName, website }),
        status: "completed",
        rawData: JSON.stringify(auditResult),
        aiAnalysis: JSON.stringify(auditResult.recommendations),
        creditsUsed: 1
      }
    });

    return NextResponse.json({
      success: true,
      data: auditResult,
      meta: {
        creditsRemaining: validation.user.planType === 'enterprise'
          ? 'unlimited'
          : (validation.user.credits - 1)
      }
    });

  } catch (error) {
    console.error("Auditor API Error:", error);
    return NextResponse.json({
      error: "Internal Server Error",
      message: String(error)
    }, { status: 500 });
  }
}
