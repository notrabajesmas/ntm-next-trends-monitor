import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Obtener historial de análisis del usuario
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("ntm_session")?.value;
    
    if (!userId) {
      return NextResponse.json({ 
        error: "No autenticado" 
      }, { status: 401 });
    }

    // Buscar análisis del usuario
    const analyses = await db.analysisRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Buscar reportes del usuario
    const reports = await db.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Obtener info del usuario
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        credits: true,
        createdAt: true
      }
    });

    // Formatear respuesta
    const history = {
      user: user ? {
        ...user,
        credits: user.credits ?? 0,
        hasUnlimited: user.planType === 'enterprise'
      } : null,
      
      stats: {
        totalAnalyses: analyses.length,
        totalReports: reports.length,
        byTool: {
          scanner: analyses.filter(a => a.toolType === 'scanner').length,
          trends: analyses.filter(a => a.toolType === 'trends').length,
          auditor: analyses.filter(a => a.toolType === 'auditor').length,
          reports: analyses.filter(a => a.toolType === 'reports').length
        }
      },

      recentAnalyses: analyses.slice(0, 10).map(a => ({
        id: a.id,
        toolType: a.toolType,
        status: a.status,
        createdAt: a.createdAt,
        input: safeParseJSON(a.inputData),
        creditsUsed: a.creditsUsed
      })),

      recentReports: reports.slice(0, 5).map(r => ({
        id: r.id,
        title: r.title,
        type: r.reportType,
        createdAt: r.createdAt,
        pdfUrl: r.pdfUrl
      }))
    };

    return NextResponse.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "Error fetching history" },
      { status: 500 }
    );
  }
}

function safeParseJSON(str: string | null): any {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
