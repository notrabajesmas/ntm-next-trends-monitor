import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

// Interfaces for type safety
interface Business {
  id?: string;
  name: string;
  address?: string;
  phone?: string | null;
  website?: string | null;
  rating?: number | null;
  reviewCount?: number;
  price?: string | null;
  businessType?: string;
  isOpen?: boolean | null;
  businessStatus?: string;
  issues?: string[];
  googleMapsUrl?: string;
  source?: string;
}

interface Trend {
  keyword?: string;
  name?: string;
  description?: string;
  snippet?: string;
  volume?: number;
  growth?: number;
  category?: string;
}

interface AuditIssue {
  category: string;
  issue: string;
  severity: "high" | "medium" | "low";
  recommendation?: string;
}

interface AuditData {
  overallScore?: number;
  issues?: AuditIssue[];
  categories?: Record<string, number>;
}

// Column width calculator
function calculateColumnWidth(data: any[], key: string): number {
  const headerWidth = key.length;
  const maxDataWidth = Math.max(
    ...data.map((item) => {
      const value = item[key];
      if (value === null || value === undefined) return 4;
      return String(value).length;
    }),
    4
  );
  return Math.min(Math.max(headerWidth, maxDataWidth) + 2, 50);
}

// Create businesses sheet
function createBusinessesSheet(businesses: Business[]): XLSX.WorkSheet {
  const headers = [
    "Nombre",
    "Dirección",
    "Teléfono",
    "Website",
    "Rating",
    "Reseñas",
    "Precio",
    "Tipo",
    "Estado",
    "Problemas",
    "Google Maps",
  ];

  const rows = businesses.map((b) => [
    b.name,
    b.address || "",
    b.phone || "",
    b.website || "",
    b.rating || "",
    b.reviewCount || 0,
    b.price || "",
    b.businessType || "",
    b.isOpen !== null ? (b.isOpen ? "Abierto" : "Cerrado") : "N/A",
    b.issues?.join("; ") || "",
    b.googleMapsUrl || "",
  ]);

  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 25 }, // Nombre
    { wch: 35 }, // Dirección
    { wch: 18 }, // Teléfono
    { wch: 30 }, // Website
    { wch: 8 }, // Rating
    { wch: 10 }, // Reseñas
    { wch: 8 }, // Precio
    { wch: 18 }, // Tipo
    { wch: 10 }, // Estado
    { wch: 40 }, // Problemas
    { wch: 35 }, // Google Maps
  ];
  ws["!cols"] = colWidths;

  // Style header row
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  return ws;
}

// Create trends sheet
function createTrendsSheet(trends: Trend[]): XLSX.WorkSheet {
  const headers = [
    "Tendencia",
    "Descripción",
    "Volumen",
    "Crecimiento",
    "Categoría",
  ];

  const rows = trends.map((t) => [
    t.name || t.keyword || "",
    t.description || t.snippet || "",
    t.volume || "",
    t.growth ? `${t.growth}%` : "",
    t.category || "",
  ]);

  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  ws["!cols"] = [
    { wch: 30 },
    { wch: 50 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
  ];

  // Style header row
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "06B6D4" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  return ws;
}

// Create audit sheet
function createAuditSheet(audit: AuditData, businessName?: string): XLSX.WorkSheet {
  const rows: any[][] = [];

  // Title section
  rows.push(["AUDITORÍA DIGITAL"]);
  rows.push(["Negocio:", businessName || "N/A"]);
  rows.push(["Fecha:", new Date().toLocaleDateString("es-ES")]);
  rows.push([]);

  // Overall score
  if (audit.overallScore !== undefined) {
    rows.push(["Puntuación General", audit.overallScore]);
    rows.push([]);
  }

  // Category scores
  if (audit.categories) {
    rows.push(["PUNTUACIONES POR CATEGORÍA"]);
    rows.push(["Categoría", "Puntuación"]);
    Object.entries(audit.categories).forEach(([cat, score]) => {
      rows.push([cat, score]);
    });
    rows.push([]);
  }

  // Issues
  if (audit.issues?.length) {
    rows.push(["PROBLEMAS DETECTADOS"]);
    rows.push(["Categoría", "Problema", "Severidad", "Recomendación"]);
    audit.issues.forEach((issue) => {
      rows.push([
        issue.category,
        issue.issue,
        issue.severity,
        issue.recommendation || "",
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws["!cols"] = [
    { wch: 25 },
    { wch: 40 },
    { wch: 12 },
    { wch: 40 },
  ];

  return ws;
}

// Create summary sheet
function createSummarySheet(
  reportType: string,
  title: string,
  stats: {
    totalBusinesses?: number;
    avgRating?: number;
    businessesWithIssues?: number;
    totalTrends?: number;
    auditScore?: number;
  }
): XLSX.WorkSheet {
  const rows: any[][] = [];

  rows.push(["NTM - NEXT TRENDS MONITOR"]);
  rows.push(["Reporte Generado"]);
  rows.push([]);
  rows.push(["Título:", title]);
  rows.push(["Tipo:", reportType]);
  rows.push(["Fecha:", new Date().toLocaleDateString("es-ES")]);
  rows.push(["Hora:", new Date().toLocaleTimeString("es-ES")]);
  rows.push([]);

  if (stats.totalBusinesses !== undefined) {
    rows.push(["RESUMEN DE NEGOCIOS"]);
    rows.push(["Total encontrados:", stats.totalBusinesses]);
    if (stats.avgRating !== undefined) {
      rows.push(["Rating promedio:", stats.avgRating.toFixed(2)]);
    }
    if (stats.businessesWithIssues !== undefined) {
      rows.push(["Con problemas:", stats.businessesWithIssues]);
    }
    rows.push([]);
  }

  if (stats.totalTrends !== undefined) {
    rows.push(["RESUMEN DE TENDENCIAS"]);
    rows.push(["Total identificadas:", stats.totalTrends]);
    rows.push([]);
  }

  if (stats.auditScore !== undefined) {
    rows.push(["RESUMEN DE AUDITORÍA"]);
    rows.push(["Puntuación general:", stats.auditScore]);
    rows.push([]);
  }

  rows.push([]);
  rows.push(["Generado por NTM - Next Trends Monitor"]);
  rows.push(["https://ntm.app"]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 25 }, { wch: 40 }];

  return ws;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title = "Reporte NTM",
      reportType = "business_scan",
      businesses = [],
      trends = [],
      audit = {},
      language = "es",
    } = body;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet (always first)
    const totalBusinesses = businesses.length;
    const avgRating =
      businesses.length > 0
        ? businesses.reduce((acc: number, b: Business) => acc + (b.rating || 0), 0) /
          businesses.length
        : 0;
    const businessesWithIssues = businesses.filter(
      (b: Business) => b.issues && b.issues.length > 0
    ).length;

    const summaryWs = createSummarySheet(reportType, title, {
      totalBusinesses,
      avgRating,
      businessesWithIssues,
      totalTrends: trends.length,
      auditScore: audit.overallScore,
    });
    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen");

    // Add sheets based on report type
    if (businesses.length > 0) {
      const businessesWs = createBusinessesSheet(businesses);
      XLSX.utils.book_append_sheet(wb, businessesWs, "Negocios");

      // Issues sheet for businesses with problems
      const businessesWithIssuesList = businesses.filter(
        (b: Business) => b.issues && b.issues.length > 0
      );
      if (businessesWithIssuesList.length > 0) {
        const issuesData = [
          ["Negocio", "Problema", "Rating", "Dirección"],
          ...businessesWithIssuesList.flatMap((b: Business) =>
            (b.issues || []).map((issue: string) => [
              b.name,
              issue,
              b.rating || "N/A",
              b.address || "",
            ])
          ),
        ];
        const issuesWs = XLSX.utils.aoa_to_sheet(issuesData);
        issuesWs["!cols"] = [{ wch: 25 }, { wch: 30 }, { wch: 8 }, { wch: 35 }];
        XLSX.utils.book_append_sheet(wb, issuesWs, "Problemas");
      }
    }

    if (trends.length > 0) {
      const trendsWs = createTrendsSheet(trends);
      XLSX.utils.book_append_sheet(wb, trendsWs, "Tendencias");
    }

    if (audit.overallScore !== undefined || audit.issues?.length > 0) {
      const auditWs = createAuditSheet(audit, title);
      XLSX.utils.book_append_sheet(wb, auditWs, "Auditoría");
    }

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Generate filename
    const filename = `NTM_${reportType}_${new Date().toISOString().split("T")[0]}_${Date.now()}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[Excel Export] Error:", error);
    return NextResponse.json(
      {
        error: "Error generating Excel",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for documentation
export async function GET() {
  return NextResponse.json({
    name: "NTM Excel Export API",
    description: "Genera archivos Excel con múltiples hojas según el tipo de reporte",
    endpoints: {
      "POST /api/export/excel": {
        description: "Genera un archivo Excel con los datos proporcionados",
        parameters: {
          title: "string - Título del reporte",
          reportType: "business_scan | trend_analysis | digital_audit | competitor_analysis",
          language: "es | en | pt (default: es)",
          businesses: "Array de negocios con { name, address, rating, issues, website, phone }",
          trends: "Array de tendencias con { name, description, volume, growth }",
          audit: "Objeto con { overallScore, issues, categories }",
        },
      },
    },
    features: [
      "Múltiples hojas según tipo de reporte",
      "Hoja de resumen siempre incluida",
      "Encabezados en negrita con colores NTM",
      "Columnas auto-ajustadas",
      "Hoja separada para problemas detectados",
      "Formato profesional",
    ],
    sheets: {
      Resumen: "Información general y estadísticas",
      Negocios: "Lista de negocios encontrados",
      Problemas: "Negocios con problemas detectados",
      Tendencias: "Tendencias identificadas",
      Auditoría: "Resultados de auditoría digital",
    },
    example: {
      title: "Scanner - Restaurantes en Buenos Aires",
      reportType: "business_scan",
      businesses: [
        {
          name: "La Parrilla",
          address: "Av. Corrientes 1234",
          rating: 4.5,
          issues: ["Sin website"],
          phone: "+54 11 1234-5678",
        },
      ],
    },
  });
}
