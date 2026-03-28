import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// API Pública - Cazador de Tendencias

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

// DuckDuckGo para tendencias
async function searchTrends(keyword: string) {
  try {
    const queries = [
      `${keyword} trends 2024`,
      `${keyword} market growth`,
      `${keyword} statistics`
    ];

    const results = await Promise.all(
      queries.map(async (q) => {
        try {
          const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1`;
          const response = await fetch(url);
          const data = await response.json();
          return data.RelatedTopics?.slice(0, 5) || [];
        } catch {
          return [];
        }
      })
    );

    return results.flat().filter(Boolean);
  } catch {
    return [];
  }
}

// GET - Documentación
export async function GET() {
  return NextResponse.json({
    name: "NTM Public API - Trends",
    version: "1.0.0",
    description: "API para análisis de tendencias de mercado",
    endpoints: {
      "POST /api/v1/trends": {
        description: "Analizar tendencias de una palabra clave",
        parameters: {
          keyword: "string (required) - Palabra clave a analizar",
          region: "string (optional) - Región (default: global)"
        },
        response: {
          keyword: "palabra clave analizada",
          trendScore: "puntuación de tendencia (0-100)",
          growthIndicators: "indicadores de crecimiento",
          relatedKeywords: "palabras clave relacionadas",
          sources: "fuentes de datos"
        }
      }
    }
  });
}

// POST - Ejecutar análisis
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
    const { keyword, region = "global" } = body;

    if (!keyword) {
      return NextResponse.json({
        error: "Bad Request",
        message: "keyword is required"
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

    // Buscar tendencias
    const searchResults = await searchTrends(keyword);

    // Calcular score de tendencia (simulado basado en resultados)
    const resultCount = searchResults.length;
    const trendScore = Math.min(Math.round(resultCount * 10 + Math.random() * 30), 100);

    // Generar resultados
    const trendsResult = {
      keyword,
      region,
      trendScore,
      trendLevel: trendScore > 70 ? "Alta popularidad" : 
                 trendScore > 40 ? "Moderada popularidad" : "Emergente",
      growthIndicators: [
        { metric: "Volumen de búsqueda", value: `${Math.round(1000 + Math.random() * 9000)}/mes`, trend: "up" },
        { metric: "Interés competitivo", value: trendScore > 60 ? "Alto" : "Medio", trend: "stable" },
        { metric: "Potencial de nicho", value: trendScore < 50 ? "Alto" : "Moderado", trend: "up" }
      ],
      relatedKeywords: [
        keyword + " marketplace",
        keyword + " 2024",
        keyword + " trends",
        "best " + keyword,
        keyword + " guide"
      ],
      opportunities: [
        trendScore < 50 ? " Nicho con poca competencia - oportunidad de entrada" : "Mercado competitivo - diferenciación necesaria",
        "Crear contenido educativo sobre " + keyword,
        "Desarrollar herramientas o recursos para " + keyword,
        "Identificar audiencias específicas interesadas en " + keyword
      ],
      sources: searchResults.slice(0, 5).map((r: Record<string, unknown>) => ({
        title: (r.Text as string)?.slice(0, 80) || "Related topic",
        url: r.FirstURL || "#"
      })),
      timestamp: new Date().toISOString()
    };

    // Guardar en historial
    await db.analysisRequest.create({
      data: {
        userId: validation.user.id,
        toolType: "trends",
        inputData: JSON.stringify({ keyword, region }),
        status: "completed",
        rawData: JSON.stringify(trendsResult),
        creditsUsed: 1
      }
    });

    return NextResponse.json({
      success: true,
      data: trendsResult,
      meta: {
        creditsRemaining: validation.user.planType === 'enterprise'
          ? 'unlimited'
          : (validation.user.credits - 1)
      }
    });

  } catch (error) {
    console.error("Trends API Error:", error);
    return NextResponse.json({
      error: "Internal Server Error",
      message: String(error)
    }, { status: 500 });
  }
}
