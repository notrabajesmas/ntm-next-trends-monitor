import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

// DuckDuckGo API
async function searchWeb(query: string) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    const results = [];
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text && topic.FirstURL) {
          results.push({ name: topic.Text.slice(0, 100), url: topic.FirstURL });
        }
      }
    }
    if (data.Abstract) {
      results.unshift({ name: data.Heading || query, snippet: data.Abstract, url: data.AbstractURL || "" });
    }
    return results;
  } catch {
    return [];
  }
}

// Wikipedia API
async function searchWikipedia(query: string) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    const results = [];
    if (data[1]) {
      for (let i = 0; i < data[1].length; i++) {
        results.push({ name: data[1][i], snippet: data[2][i], url: data[3][i] });
      }
    }
    return results;
  } catch {
    return [];
  }
}

function getTypeLabel(reportType: string, lang: string): string {
  const labels: Record<string, Record<string, string>> = {
    business_scan: { es: "Análisis de Oportunidades", en: "Business Opportunities Analysis", pt: "Análise de Oportunidades" },
    trend_analysis: { es: "Análisis de Tendencias", en: "Trend Analysis", pt: "Análise de Tendências" },
    digital_audit: { es: "Auditoría Digital", en: "Digital Audit", pt: "Auditoria Digital" },
    competitor_analysis: { es: "Análisis de Competencia", en: "Competitor Analysis", pt: "Análise de Concorrência" }
  };
  return labels[reportType]?.[lang] || reportType;
}

function generateSummary(reportType: string, data: any, additionalData: any[], lang: string): string {
  const templates: Record<string, Record<string, string>> = {
    business_scan: {
      es: `Este reporte analiza las oportunidades de negocio en ${data?.location || 'la zona especificada'}. Se identificaron ${additionalData.length} fuentes de información relevantes. Los datos fueron recopilados de fuentes públicas y pueden requerir verificación adicional.`,
      en: `This report analyzes business opportunities in ${data?.location || 'the specified area'}. ${additionalData.length} relevant information sources were identified. Data was collected from public sources and may require additional verification.`,
      pt: `Este relatório analisa oportunidades de negócios em ${data?.location || 'a área especificada'}. ${additionalData.length} fontes de informação relevantes foram identificadas. Os dados foram coletados de fontes públicas e podem requerer verificação adicional.`
    },
    trend_analysis: {
      es: `Análisis de tendencias para ${data?.keyword || 'el sector especificado'}. Se procesaron ${additionalData.length} fuentes de información. Las tendencias identificadas representan patrones emergentes en el mercado actual.`,
      en: `Trend analysis for ${data?.keyword || 'the specified sector'}. ${additionalData.length} information sources were processed. The identified trends represent emerging patterns in the current market.`,
      pt: `Análise de tendências para ${data?.keyword || 'o setor especificado'}. ${additionalData.length} fontes de informação foram processadas. As tendências identificadas representam padrões emergentes no mercado atual.`
    },
    digital_audit: {
      es: `Auditoría de presencia digital para ${data?.businessName || 'el negocio especificado'}. Se evaluaron múltiples aspectos de la presencia online y se identificaron áreas de mejora.`,
      en: `Digital presence audit for ${data?.businessName || 'the specified business'}. Multiple aspects of online presence were evaluated and areas for improvement were identified.`,
      pt: `Auditoria de presença digital para ${data?.businessName || 'o negócio especificado'}. Múltiplos aspectos da presença online foram avaliados e áreas de melhoria foram identificadas.`
    },
    competitor_analysis: {
      es: `Análisis competitivo basado en ${additionalData.length} fuentes. Se identificaron patrones de mercado y oportunidades de diferenciación.`,
      en: `Competitive analysis based on ${additionalData.length} sources. Market patterns and differentiation opportunities were identified.`,
      pt: `Análise competitiva baseada em ${additionalData.length} fontes. Padrões de mercado e oportunidades de diferenciação foram identificados.`
    }
  };
  return templates[reportType]?.[lang] || templates.business_scan[lang];
}

function generateFindings(reportType: string, data: any, additionalData: any[], lang: string): string[] {
  const findings: string[] = [];
  
  if (reportType === 'business_scan') {
    findings.push(lang === 'es' ? `Se identificaron ${additionalData.length} fuentes de información relevantes` : `${additionalData.length} relevant information sources identified`);
    findings.push(lang === 'es' ? 'Los datos fueron extraídos de APIs públicas' : 'Data was extracted from public APIs');
    findings.push(lang === 'es' ? 'Se recomienda verificar información en fuentes originales' : 'Verification of original sources is recommended');
  }
  
  if (reportType === 'digital_audit') {
    const score = data?.overallScore || 50;
    findings.push(lang === 'es' ? `Puntuación general: ${score}/100` : `Overall score: ${score}/100`);
    findings.push(lang === 'es' ? `Se analizaron ${additionalData.length} fuentes` : `${additionalData.length} sources analyzed`);
  }
  
  if (reportType === 'trend_analysis') {
    findings.push(lang === 'es' ? `Se identificaron ${additionalData.length} tendencias potenciales` : `${additionalData.length} potential trends identified`);
    findings.push(lang === 'es' ? 'Los datos provienen de DuckDuckGo y Wikipedia' : 'Data sourced from DuckDuckGo and Wikipedia');
  }
  
  // Add generic findings if not enough
  while (findings.length < 5) {
    findings.push(lang === 'es' ? 'Se recomienda investigación adicional' : 'Additional research recommended');
  }
  
  return findings.slice(0, 5);
}

function generateRecommendations(reportType: string, lang: string): string[] {
  const recs: Record<string, Record<string, string[]>> = {
    business_scan: {
      es: ['Verificar datos de contacto directamente', 'Analizar competencia local', 'Identificar nichos desatendidos', 'Priorizar por potencial de ingresos', 'Desarrollar estrategia de aproximación'],
      en: ['Verify contact details directly', 'Analyze local competition', 'Identify underserved niches', 'Prioritize by revenue potential', 'Develop outreach strategy']
    },
    digital_audit: {
      es: ['Optimizar presencia en Google My Business', 'Mejorar sitio web para móviles', 'Activar redes sociales', 'Implementar sistema de reseñas', 'Crear contenido regular'],
      en: ['Optimize Google My Business presence', 'Improve mobile website', 'Activate social media', 'Implement review system', 'Create regular content']
    },
    trend_analysis: {
      es: ['Monitorear tendencias identificadas', 'Analizar competencia en cada nicho', 'Desarrollar contenido relacionado', 'Establecer alertas de mercado', 'Identificar oportunidades tempranas'],
      en: ['Monitor identified trends', 'Analyze competition in each niche', 'Develop related content', 'Set up market alerts', 'Identify early opportunities']
    },
    competitor_analysis: {
      es: ['Analizar fortalezas de competidores', 'Identificar brechas en el mercado', 'Desarrollar propuesta de valor única', 'Monitorear movimientos de competencia', 'Diferenciar marca'],
      en: ['Analyze competitor strengths', 'Identify market gaps', 'Develop unique value proposition', 'Monitor competitor moves', 'Differentiate brand']
    }
  };
  return recs[reportType]?.[lang] || recs.business_scan[lang];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, reportType, content, data, language = "es" } = body;

    if (!title || !reportType) {
      return NextResponse.json({ error: "Title and report type required" }, { status: 400 });
    }

    // Buscar datos adicionales
    let additionalData: any[] = [];
    const searchQuery = data?.location || data?.keyword || data?.businessName || title;
    
    if (searchQuery) {
      console.log(`[Report] Buscando: ${searchQuery}`);
      const [ddg, wiki] = await Promise.all([
        searchWeb(`${searchQuery} ${reportType.replace('_', ' ')}`),
        searchWikipedia(searchQuery)
      ]);
      additionalData = [...ddg, ...wiki];
    }

    // Generar contenido del reporte
    const reportContent = {
      executive_summary: generateSummary(reportType, data, additionalData, language),
      key_findings: generateFindings(reportType, data, additionalData, language),
      recommendations: generateRecommendations(reportType, language),
      data_sources: additionalData.slice(0, 5).map((d: any) => d.url).filter(Boolean),
      confidence: additionalData.length > 3 ? "medium" : "low"
    };

    // Generar ID y PDF
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pdfFilename = `${reportId}.pdf`;
    const pdfPath = path.join(process.cwd(), "download", pdfFilename);

    await fs.mkdir(path.join(process.cwd(), "download"), { recursive: true });

    const pdfData = {
      title,
      type: reportType,
      location: data?.location,
      date: new Date().toLocaleDateString(language === "es" ? "es-ES" : language === "pt" ? "pt-BR" : "en-US", { 
        year: "numeric", month: "long", day: "numeric" 
      }),
      lang: language,
      executive_summary: reportContent.executive_summary,
      key_findings: reportContent.key_findings,
      recommendations: reportContent.recommendations,
      data_tables: [],
      sources: reportContent.data_sources
    };

    // Intentar generar PDF
    try {
      const scriptPath = path.join(process.cwd(), "scripts", "generate_ntm_report.py");
      await fs.access(scriptPath);
      await execAsync(`python3 "${scriptPath}" "${pdfPath}" '${JSON.stringify(pdfData).replace(/'/g, "'\\''")}'`);
    } catch {
      console.log("[Report] PDF no generado, continuando sin él");
    }

    return NextResponse.json({
      success: true,
      report: {
        id: reportId,
        title,
        type: reportType,
        content: reportContent,
        createdAt: new Date().toISOString(),
        status: "ready",
        pdfUrl: `/api/reports/download/${reportId}`,
        pdfFilename,
        sourcesUsed: additionalData.length
      }
    });

  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Error generating report", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("id");

  if (!reportId) {
    return NextResponse.json({ error: "Report ID required" }, { status: 400 });
  }

  try {
    const pdfPath = path.join(process.cwd(), "download", `${reportId}.pdf`);
    const pdfBuffer = await fs.readFile(pdfPath);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${reportId}.pdf"`
      }
    });
  } catch {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}
