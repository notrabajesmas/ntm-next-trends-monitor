import { NextRequest, NextResponse } from "next/server";

// Google PageSpeed Insights API - GRATIS
// https://developers.google.com/speed/docs/insights/v5/get-started

interface PageSpeedResult {
  url: string;
  strategy: 'mobile' | 'desktop';
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    'best-practices': { score: number };
    seo: { score: number };
  };
  lighthouseResult: {
    audits: Record<string, {
      score: number | null;
      title: string;
      description: string;
      displayValue?: string;
    }>;
  };
}

async function runPageSpeed(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PAGESPEED_KEY;
  
  const params = new URLSearchParams({
    url: url.startsWith('http') ? url : `https://${url}`,
    key: apiKey || '',
    strategy,
    category: ['performance', 'accessibility', 'best-practices', 'seo'].join('&category=')
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
      { next: { revalidate: 3600 } } // Cache 1 hora
    );

    if (!response.ok) {
      console.error(`[PageSpeed] Error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[PageSpeed] Error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, businessName } = body;

    if (!url) {
      return NextResponse.json({ 
        error: "URL is required" 
      }, { status: 400 });
    }

    console.log(`[PageSpeed] Analyzing: ${url}`);

    // Ejecutar análisis móvil y desktop en paralelo
    const [mobile, desktop] = await Promise.all([
      runPageSpeed(url, 'mobile'),
      runPageSpeed(url, 'desktop')
    ]);

    // Construir resultado
    const result = {
      url,
      businessName: businessName || url,
      timestamp: new Date().toISOString(),
      mobile: mobile ? {
        performance: Math.round((mobile.categories?.performance?.score || 0) * 100),
        accessibility: Math.round((mobile.categories?.accessibility?.score || 0) * 100),
        bestPractices: Math.round((mobile.categories?.['best-practices']?.score || 0) * 100),
        seo: Math.round((mobile.categories?.seo?.score || 0) * 100),
        coreWebVitals: extractCoreWebVitals(mobile)
      } : null,
      desktop: desktop ? {
        performance: Math.round((desktop.categories?.performance?.score || 0) * 100),
        accessibility: Math.round((desktop.categories?.accessibility?.score || 0) * 100),
        bestPractices: Math.round((desktop.categories?.['best-practices']?.score || 0) * 100),
        seo: Math.round((desktop.categories?.seo?.score || 0) * 100)
      } : null,
      issues: extractIssues(mobile),
      recommendations: extractRecommendations(mobile),
      dataSource: mobile ? "Google PageSpeed Insights API" : "Fallback"
    };

    // Calcular score general
    const avgPerformance = result.mobile && result.desktop 
      ? (result.mobile.performance + result.desktop.performance) / 2 
      : result.mobile?.performance || 50;

    return NextResponse.json({
      success: true,
      data: result,
      overallScore: Math.round(avgPerformance)
    });

  } catch (error) {
    console.error("[PageSpeed] Error:", error);
    return NextResponse.json(
      { error: "Error analyzing page speed", details: String(error) },
      { status: 500 }
    );
  }
}

function extractCoreWebVitals(data: PageSpeedResult | null) {
  if (!data?.lighthouseResult?.audits) return null;

  const audits = data.lighthouseResult.audits;
  
  return {
    lcp: audits['largest-contentful-paint']?.displayValue || null,
    fid: audits['max-potential-fid']?.displayValue || null,
    cls: audits['cumulative-layout-shift']?.displayValue || null,
    fcp: audits['first-contentful-paint']?.displayValue || null,
    ttfb: audits['server-response-time']?.displayValue || null
  };
}

function extractIssues(data: PageSpeedResult | null): string[] {
  if (!data?.lighthouseResult?.audits) return [];

  const issues: string[] = [];
  const audits = data.lighthouseResult.audits;

  // Problemas comunes
  const problemAudits = [
    'viewport', 'document-title', 'meta-description', 'robots-txt',
    'image-alt', 'link-name', 'color-contrast', 'font-size',
    'plugins', 'mobile-friendly', 'https', 'redirects-http'
  ];

  for (const key of problemAudits) {
    const audit = audits[key];
    if (audit && audit.score !== null && audit.score < 1) {
      issues.push(audit.title);
    }
  }

  // Verificar problemas de rendimiento
  if (audits['speed-index']?.score && audits['speed-index'].score < 0.5) {
    issues.push("Speed Index bajo");
  }
  if (audits['largest-contentful-paint']?.score && audits['largest-contentful-paint'].score < 0.5) {
    issues.push("LCP lento");
  }

  return issues.slice(0, 10);
}

function extractRecommendations(data: PageSpeedResult | null): string[] {
  if (!data?.lighthouseResult?.audits) return [];

  const recommendations: string[] = [];
  const audits = data.lighthouseResult.audits;

  // Recomendaciones de optimización
  const optimizationAudits = [
    'uses-optimized-images', 'uses-text-compression', 'uses-responsive-images',
    'offscreen-images', 'unminified-css', 'unminified-javascript',
    'unused-css-rules', 'unused-javascript', 'modern-image-formats',
    'uses-rel-preconnect', 'uses-rel-preload'
  ];

  for (const key of optimizationAudits) {
    const audit = audits[key];
    if (audit && audit.score !== null && audit.score < 1) {
      recommendations.push(`${audit.title}: ${audit.displayValue || 'optimizar'}`);
    }
  }

  return recommendations.slice(0, 8);
}

// GET para obtener resultado cacheado
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  // Reutilizar el mismo código POST
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ url }),
    headers: { 'Content-Type': 'application/json' }
  }));
}
