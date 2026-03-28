import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Middleware para verificar autenticación y créditos
async function checkCredits(userId: string): Promise<{ hasCredits: boolean; credits: number; planType: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true, planType: true }
  });

  if (!user) {
    return { hasCredits: false, credits: 0, planType: 'free' };
  }

  // Enterprise tiene ilimitados
  if (user.planType === 'enterprise') {
    return { hasCredits: true, credits: -1, planType: user.planType };
  }

  return { 
    hasCredits: (user.credits ?? 0) > 0, 
    credits: user.credits ?? 0,
    planType: user.planType 
  };
}

// Descontar crédito
async function consumeCredit(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true, planType: true }
  });

  if (!user) return false;
  if (user.planType === 'enterprise') return true; // Ilimitado
  if ((user.credits ?? 0) <= 0) return false;

  await db.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } }
  });

  return true;
}

// Obtener usuario de la sesión
function getUserId(request: NextRequest): string | null {
  return request.cookies.get("ntm_session")?.value || null;
}

// Exportar funciones para usar en otras APIs
export { checkCredits, consumeCredit, getUserId };

// API endpoint para verificar créditos
export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  
  if (!userId) {
    return NextResponse.json({ 
      authenticated: false, 
      credits: 0,
      planType: 'free'
    });
  }

  const { credits, planType } = await checkCredits(userId);
  
  return NextResponse.json({
    authenticated: true,
    credits,
    planType,
    hasUnlimited: planType === 'enterprise'
  });
}

// API endpoint para usar crédito
export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  
  if (!userId) {
    return NextResponse.json({ 
      success: false, 
      error: "No autenticado" 
    }, { status: 401 });
  }

  const { hasCredits, credits, planType } = await checkCredits(userId);
  
  if (!hasCredits && planType !== 'enterprise') {
    return NextResponse.json({ 
      success: false, 
      error: "Sin créditos disponibles",
      credits: 0,
      planType
    }, { status: 402 }); // 402 Payment Required
  }

  const consumed = await consumeCredit(userId);
  
  if (!consumed && planType !== 'enterprise') {
    return NextResponse.json({ 
      success: false, 
      error: "Error al consumir crédito" 
    }, { status: 500 });
  }

  // Obtener créditos restantes
  const updated = await checkCredits(userId);
  
  return NextResponse.json({
    success: true,
    creditsConsumed: 1,
    creditsRemaining: updated.credits,
    planType: updated.planType
  });
}
