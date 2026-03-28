import { NextRequest, NextResponse } from "next/server";

// DuckDuckGo Instant Answer API
async function searchWeb(query: string) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    const results = [];
    
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 8)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            name: topic.Text.slice(0, 100),
            snippet: topic.Text,
            url: topic.FirstURL
          });
        }
      }
    }
    
    if (data.Abstract) {
      results.unshift({
        name: data.Heading || query,
        snippet: data.Abstract,
        url: data.AbstractURL || ""
      });
    }
    
    return results;
  } catch (error) {
    return [];
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
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return { exists: false, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, website } = body;

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    console.log(`[Auditor] Auditando: ${businessName}`);

    // Búsquedas múltiples
    const searchQueries = [
      `"${businessName}" reviews`,
      `"${businessName}" google maps`,
      `"${businessName}" facebook instagram`,
      `"${businessName}" contact info`
    ];

    const searchPromises = searchQueries.map(q => searchWeb(q));
    const searchResults = await Promise.all(searchPromises);
    const allResults = searchResults.flat().filter((r: any) => r.name);

    // Verificar sitio web si existe
    let websiteCheck = null;
    if (website) {
      console.log(`[Auditor] Verificando sitio: ${website}`);
      websiteCheck = await checkWebsite(website);
    }

    // Encontrar menciones
    const foundInResults = allResults.length > 0;
    const foundOnGoogle = allResults.some((r: any) => 
      r.url?.includes('google') || r.snippet?.toLowerCase().includes(businessName.toLowerCase())
    );
    const foundOnSocial = allResults.some((r: any) => 
      r.url?.includes('facebook') || 
      r.url?.includes('instagram') || 
      r.url?.includes('twitter') ||
      r.url?.includes('linkedin')
    );

    // Calcular score
    let score = 0;
    if (websiteCheck?.exists) score += 20;
    if (foundOnGoogle) score += 25;
    if (foundOnSocial) score += 15;
    if (foundInResults) score += 10;
    if (website) score += 10;

    const auditResult = {
      overallScore: Math.min(score, 100),
      businessInfo: {
        name: businessName,
        foundOnGoogle,
        hasWebsite: websiteCheck?.exists || false,
        websiteUrl: website || null,
        websiteStatus: websiteCheck?.status || null,
        hasSocialMedia: foundOnSocial,
        socialPlatforms: foundOnSocial ? ["Detectado en resultados"] : []
      },
      categories: [
        {
          name: "Presencia Web",
          score: websiteCheck?.exists ? 70 : (website ? 30 : 10),
          status: websiteCheck?.exists ? "good" : (website ? "warning" : "bad"),
          items: [
            { 
              name: "Sitio web", 
              status: websiteCheck?.exists ? "pass" : "fail", 
              message: websiteCheck?.exists 
                ? `Sitio web accesible (Status: ${websiteCheck.status})` 
                : (website ? "No se pudo acceder al sitio" : "No tiene sitio web"),
              source: website || null
            },
            { 
              name: "HTTPS", 
              status: website?.startsWith('https') ? "pass" : "warning", 
              message: website?.startsWith('https') ? "Conexión segura" : "Verificar SSL"
            }
          ]
        },
        {
          name: "Visibilidad en Búsqueda",
          score: foundOnGoogle ? 60 : 20,
          status: foundOnGoogle ? "good" : "warning",
          items: [
            { 
              name: "Aparece en Google", 
              status: foundOnGoogle ? "pass" : "fail", 
              message: foundOnGoogle 
                ? "Se encontraron menciones en resultados" 
                : "No aparece en los primeros resultados"
            },
            { 
              name: "Menciones online", 
              status: foundInResults ? "pass" : "warning", 
              message: `${allResults.length} resultados encontrados`
            }
          ]
        },
        {
          name: "Redes Sociales",
          score: foundOnSocial ? 50 : 20,
          status: foundOnSocial ? "warning" : "bad",
          items: [
            { 
              name: "Presencia en redes", 
              status: foundOnSocial ? "pass" : "fail", 
              message: foundOnSocial 
                ? "Se detectaron perfiles sociales" 
                : "No se encontraron perfiles verificados"
            }
          ]
        }
      ],
      recommendations: [
        website ? "✓ Verificar que el sitio web esté optimizado para móviles" : "🚨 Crear un sitio web profesional",
        foundOnGoogle ? "✓ Mantener actualizado el perfil de Google My Business" : "📌 Registrar en Google My Business",
        foundOnSocial ? "✓ Mantener activas las redes sociales" : "📱 Crear perfiles en redes sociales principales",
        "🔗 Registrar en directorios locales y de industria",
        "⭐ Implementar sistema de reseñas de clientes"
      ],
      quickWins: [
        website ? "Actualizar contenido del sitio web" : "Crear landing page básica",
        "Responder a reseñas existentes",
        "Publicar contenido regularmente en redes"
      ],
      dataQuality: "medium",
      sourcesFound: allResults.length,
      rawSources: allResults.slice(0, 5),
      dataSource: "DuckDuckGo API + Verificación HTTP"
    };

    return NextResponse.json({
      success: true,
      data: auditResult,
      businessName,
      timestamp: new Date().toISOString(),
      sourcesAnalyzed: allResults.length
    });

  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json(
      { 
        error: "Error performing audit",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
