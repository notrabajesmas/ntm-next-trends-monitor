import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "crypto";

// Login - Autentica al usuario y establece cookie de sesión
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos", success: false },
        { status: 400 }
      );
    }

    console.log(`[Auth] Intento de login: ${email}`);

    // Buscar usuario
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.log(`[Auth] Usuario no encontrado: ${email}`);
      return NextResponse.json(
        { error: "Usuario no encontrado", success: false },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const hashedPassword = createHash("sha256").update(password).digest("hex");
    
    if (user.password !== hashedPassword) {
      console.log(`[Auth] Contraseña incorrecta para: ${email}`);
      return NextResponse.json(
        { error: "Contraseña incorrecta", success: false },
        { status: 401 }
      );
    }

    console.log(`[Auth] Login exitoso: ${email}`);

    // Crear respuesta con datos del usuario
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType,
        credits: user.credits
      }
    });

    // Establecer cookies de sesión con configuración robusta
    // Cookie principal de sesión
    response.cookies.set("ntm_session", user.id, {
      httpOnly: true,
      secure: true, // Siempre true para producción
      sameSite: "none", // Importante para que funcione entre dominios
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: "/"
    });

    // Cookie de respaldo con email
    response.cookies.set("ntm_user_email", user.email, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });

    // Cookie de estado para el frontend (no sensible)
    response.cookies.set("ntm_logged_in", "true", {
      httpOnly: false, // Accesible desde JS
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });

    console.log(`[Auth] Cookies establecidas para: ${email}`);

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión", success: false },
      { status: 500 }
    );
  }
}
