import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Obtener información del usuario logueado
export async function GET(request: NextRequest) {
  try {
    // Intentar obtener sesión de múltiples cookies
    const userId = request.cookies.get("ntm_session")?.value;
    const userEmail = request.cookies.get("ntm_user_email")?.value;

    console.log(`[Auth/Me] Verificando sesión - UserID: ${userId?.slice(0, 8)}... Email: ${userEmail}`);

    if (!userId && !userEmail) {
      console.log("[Auth/Me] No hay cookies de sesión");
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    // Buscar usuario por ID o email
    const user = userId 
      ? await db.user.findUnique({ where: { id: userId } })
      : await db.user.findUnique({ where: { email: userEmail! } });

    if (!user) {
      console.log("[Auth/Me] Usuario no encontrado en BD");
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    console.log(`[Auth/Me] Usuario autenticado: ${user.email}`);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType,
        credits: user.credits,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { authenticated: false, user: null, error: "Error checking session" },
      { status: 500 }
    );
  }
}
