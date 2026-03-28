import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import React from "react";

// Register fonts for better typography
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2" },
  ],
});

// NTM Brand Colors
const COLORS = {
  emerald: "#10B981",
  emeraldDark: "#059669",
  cyan: "#06B6D4",
  cyanDark: "#0891B2",
  dark: "#0f172a",
  gray: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  white: "#ffffff",
  error: "#ef4444",
  warning: "#f59e0b",
  success: "#22c55e",
};

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: COLORS.white,
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.emerald,
    paddingBottom: 15,
  },
  logo: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.emerald,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  logoText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  dateContainer: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 9,
    color: COLORS.gray[500],
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.emerald,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  card: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyan,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 9,
    color: COLORS.gray[600],
    lineHeight: 1.5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.emerald,
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "bold",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    padding: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    padding: 8,
    backgroundColor: COLORS.gray[50],
  },
  tableCell: {
    fontSize: 8,
    color: COLORS.gray[700],
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
  },
  badgeSuccess: {
    backgroundColor: COLORS.success,
    color: COLORS.white,
  },
  badgeWarning: {
    backgroundColor: COLORS.warning,
    color: COLORS.white,
  },
  badgeError: {
    backgroundColor: COLORS.error,
    color: COLORS.white,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: 6,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.emerald,
  },
  metricLabel: {
    fontSize: 8,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  issueItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  issueIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: COLORS.gray[400],
  },
  footerBrand: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.emerald,
  },
  chartPlaceholder: {
    height: 100,
    backgroundColor: COLORS.gray[100],
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  chartPlaceholderText: {
    fontSize: 9,
    color: COLORS.gray[400],
  },
});

// Helper to get type label
function getTypeLabel(reportType: string, lang: string = "es"): string {
  const labels: Record<string, Record<string, string>> = {
    business_scan: { es: "Escaneo de Negocios", en: "Business Scan", pt: "Escaneamento de Negócios" },
    trend_analysis: { es: "Análisis de Tendencias", en: "Trend Analysis", pt: "Análise de Tendências" },
    digital_audit: { es: "Auditoría Digital", en: "Digital Audit", pt: "Auditoria Digital" },
    competitor_analysis: { es: "Análisis de Competencia", en: "Competitor Analysis", pt: "Análise de Concorrência" },
  };
  return labels[reportType]?.[lang] || reportType;
}

// PDF Document Component
function NTMReportDocument({ data }: { data: any }) {
  const { title, reportType, language = "es", businesses = [], audit = {}, trends = [], summary, recommendations = [] } = data;
  const generatedDate = new Date().toLocaleDateString(
    language === "es" ? "es-ES" : language === "pt" ? "pt-BR" : "en-US",
    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  );

  // Calculate metrics
  const totalBusinesses = businesses.length;
  const avgRating = businesses.reduce((acc: number, b: any) => acc + (b.rating || 0), 0) / (totalBusinesses || 1);
  const businessesWithIssues = businesses.filter((b: any) => b.issues?.length > 0).length;
  const businessesWithoutWebsite = businesses.filter((b: any) => !b.website).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>NTM</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{title || "Reporte NTM"}</Text>
            <Text style={styles.subtitle}>{getTypeLabel(reportType, language)}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{generatedDate}</Text>
          </View>
        </View>

        {/* Metrics Summary */}
        {totalBusinesses > 0 && (
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{totalBusinesses}</Text>
              <Text style={styles.metricLabel}>Negocios</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>Rating Promedio</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{businessesWithoutWebsite}</Text>
              <Text style={styles.metricLabel}>Sin Website</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{businessesWithIssues}</Text>
              <Text style={styles.metricLabel}>Con Problemas</Text>
            </View>
          </View>
        )}

        {/* Summary Section */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
            <View style={styles.card}>
              <Text style={styles.cardText}>{summary}</Text>
            </View>
          </View>
        )}

        {/* Businesses Table */}
        {businesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Negocios Encontrados ({businesses.length})</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Nombre</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Dirección</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Rating</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Estado</Text>
              </View>
              {businesses.slice(0, 20).map((business: any, index: number) => (
                <View key={business.id || index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{business.name?.slice(0, 30)}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{business.address?.slice(0, 35)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{business.rating || "N/A"}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {business.isOpen !== null ? (business.isOpen ? "Abierto" : "Cerrado") : "N/A"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Issues Detected */}
        {businesses.some((b: any) => b.issues?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problemas Detectados</Text>
            {businesses.slice(0, 10).filter((b: any) => b.issues?.length > 0).map((business: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{business.name}</Text>
                <Text style={styles.cardText}>{business.issues?.join(" • ")}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Trends Section */}
        {trends.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendencias Identificadas</Text>
            {trends.slice(0, 5).map((trend: any, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{trend.name || trend.keyword}</Text>
                <Text style={styles.cardText}>{trend.description || trend.snippet}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Audit Results */}
        {audit.overallScore !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resultados de Auditoría</Text>
            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: audit.overallScore >= 70 ? COLORS.success : audit.overallScore >= 40 ? COLORS.warning : COLORS.error }]}>
                  {audit.overallScore}
                </Text>
                <Text style={styles.metricLabel}>Puntuación General</Text>
              </View>
            </View>
            {audit.issues?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Problemas de Auditoría</Text>
                <Text style={styles.cardText}>{audit.issues.join("\n")}</Text>
              </View>
            )}
          </View>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendaciones</Text>
            {recommendations.map((rec: string, index: number) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardText}>{index + 1}. {rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Chart Placeholder */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>[Gráficos disponibles en la versión interactiva]</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generado por NTM - Next Trends Monitor
          </Text>
          <Text style={styles.footerBrand}>ntm.app</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title = "Reporte NTM",
      reportType = "business_scan",
      language = "es",
      businesses = [],
      audit = {},
      trends = [],
      summary = "",
      recommendations = [],
    } = body;

    // Create PDF document
    const document = React.createElement(NTMReportDocument, {
      data: {
        title,
        reportType,
        language,
        businesses,
        audit,
        trends,
        summary,
        recommendations,
      },
    });

    // Generate PDF
    const pdfBuffer = await pdf(document).toBuffer();

    // Generate filename
    const filename = `NTM_Report_${new Date().toISOString().split("T")[0]}_${Date.now()}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[PDF Export] Error:", error);
    return NextResponse.json(
      {
        error: "Error generating PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for documentation
export async function GET() {
  return NextResponse.json({
    name: "NTM PDF Export API",
    description: "Genera reportes PDF profesionales con estilo corporativo NTM",
    endpoints: {
      "POST /api/export/pdf": {
        description: "Genera un PDF con los datos proporcionados",
        parameters: {
          title: "string - Título del reporte",
          reportType: "business_scan | trend_analysis | digital_audit | competitor_analysis",
          language: "es | en | pt (default: es)",
          businesses: "Array de negocios con { name, address, rating, issues, website }",
          audit: "Objeto con { overallScore, issues }",
          trends: "Array de tendencias",
          summary: "string - Resumen ejecutivo",
          recommendations: "Array de strings con recomendaciones",
        },
      },
    },
    features: [
      "Logo NTM y branding corporativo",
      "Colores emerald/cyan",
      "Tablas de negocios con ratings",
      "Métricas resumidas",
      "Problemas detectados",
      "Recomendaciones",
      "Fecha de generación",
    ],
    example: {
      title: "Scanner - Restaurantes en Buenos Aires",
      reportType: "business_scan",
      language: "es",
      businesses: [
        { name: "La Parrilla", address: "Av. Corrientes 1234", rating: 4.5, issues: ["Sin website"] },
      ],
      summary: "Se encontraron 15 restaurantes en la zona",
      recommendations: ["Verificar datos de contacto", "Analizar competencia"],
    },
  });
}
