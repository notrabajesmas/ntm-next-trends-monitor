import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

// POST - Crear un reporte compartido
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("ntm_session")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { reportType, title, content, expiresInDays } = body;

    if (!reportType || !title || !content) {
      return NextResponse.json({ 
        error: "Faltan datos requeridos: reportType, title, content" 
      }, { status: 400 });
    }

    // Generar código único para compartir
    const shareCode = nanoid(10); // 10 caracteres únicos

    // Calcular fecha de expiración si se especifica
    let expiresAt: Date | undefined;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    const sharedReport = await db.sharedReport.create({
      data: {
        userId,
        reportType,
        title,
        content: JSON.stringify(content),
        shareCode,
        isPublic: true,
        expiresAt
      }
    });

    // URL para compartir
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${shareCode}`;

    return NextResponse.json({
      success: true,
      message: "Reporte creado para compartir",
      data: {
        id: sharedReport.id,
        shareCode,
        shareUrl,
        expiresAt: sharedReport.expiresAt
      }
    });

  } catch (error) {
    console.error("Error creating shared report:", error);
    return NextResponse.json({ error: "Error al crear reporte compartido" }, { status: 500 });
  }
}

// GET - Obtener reportes compartidos del usuario
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("ntm_session")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const sharedReports = await db.sharedReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const reportsWithUrl = sharedReports.map(r => ({
      ...r,
      content: JSON.parse(r.content),
      shareUrl: `/share/${r.shareCode}`,
      isExpired: r.expiresAt ? new Date() > r.expiresAt : false
    }));

    return NextResponse.json({
      success: true,
      data: reportsWithUrl
    });

  } catch (error) {
    console.error("Error fetching shared reports:", error);
    return NextResponse.json({ error: "Error al obtener reportes" }, { status: 500 });
  }
}

// DELETE - Eliminar reporte compartido
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.cookies.get("ntm_session")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shareCode = searchParams.get("code");

    if (!shareCode) {
      return NextResponse.json({ error: "Código de reporte requerido" }, { status: 400 });
    }

    // Verificar que pertenece al usuario
    const report = await db.sharedReport.findFirst({
      where: { shareCode, userId }
    });

    if (!report) {
      return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
    }

    await db.sharedReport.delete({
      where: { id: report.id }
    });

    return NextResponse.json({
      success: true,
      message: "Reporte eliminado"
    });

  } catch (error) {
    console.error("Error deleting shared report:", error);
    return NextResponse.json({ error: "Error al eliminar reporte" }, { status: 500 });
  }
}
