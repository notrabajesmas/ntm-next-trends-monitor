import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Guardar un nuevo análisis en el historial
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("ntm_session")?.value;
    const body = await request.json();
    
    const { toolType, inputData, rawData, creditsUsed = 1 } = body;

    if (!toolType) {
      return NextResponse.json({ error: "toolType required" }, { status: 400 });
    }

    // Crear registro de análisis
    const analysis = await db.analysisRequest.create({
      data: {
        userId: userId || null,
        toolType,
        inputData: JSON.stringify(inputData || {}),
        rawData: rawData ? JSON.stringify(rawData) : null,
        creditsUsed,
        status: 'completed'
      }
    });

    return NextResponse.json({
      success: true,
      id: analysis.id
    });

  } catch (error) {
    console.error("Save analysis error:", error);
    return NextResponse.json(
      { error: "Error saving analysis" },
      { status: 500 }
    );
  }
}
