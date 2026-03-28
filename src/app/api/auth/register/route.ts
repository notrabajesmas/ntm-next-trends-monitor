import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validaciones
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Hashear contraseña
    const hashedPassword = createHash("sha256").update(password).digest("hex");

    // Crear usuario con plan gratuito
    const user = await db.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        planType: "free",
        credits: 3 // Créditos gratuitos iniciales
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType,
        credits: user.credits
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        error: "Error al registrar usuario",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
