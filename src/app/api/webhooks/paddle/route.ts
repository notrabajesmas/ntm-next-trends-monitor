import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Webhook de Paddle - Se llama automáticamente cuando alguien paga
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("[Paddle Webhook] Evento recibido:", JSON.stringify(body, null, 2));

    // Paddle envía diferentes tipos de eventos
    const eventType = body.event_type || body.alert_name || body.event_type;
    const data = body.data || body;

    // Procesar según el tipo de evento
    switch (eventType) {
      case 'transaction.completed':
      case 'payment_succeeded':
      case 'subscription_created':
      case 'subscription_updated':
        await handlePaymentSuccess(data);
        break;
      
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(data);
        break;
      
      case 'subscription_renewed':
        await handleSubscriptionRenewed(data);
        break;
      
      default:
        console.log(`[Paddle Webhook] Evento no manejado: ${eventType}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Webhook processed",
      eventType 
    });

  } catch (error) {
    console.error("[Paddle Webhook] Error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(data: any) {
  try {
    // Obtener email del cliente
    const customerEmail = data.customer?.email || 
                          data.passthrough || 
                          data.custom_data?.email ||
                          extractEmailFromPassthrough(data.passthrough);

    if (!customerEmail) {
      console.error("[Paddle] No se encontró email del cliente");
      return;
    }

    // Determinar el plan basado en el price_id o product_id
    const priceId = data.items?.[0]?.price?.id || 
                    data.price_id || 
                    data.product_id;
    
    let planType = 'pro';
    let credits = 100;

    if (priceId?.includes('enterprise') || priceId === 'pri_01km5a65d2t8jy65s00qkscpa1') {
      planType = 'enterprise';
      credits = -1; // Ilimitado
    } else if (priceId?.includes('pro') || priceId === 'pri_01km5a0xnesah58qp21ekn4xrr') {
      planType = 'pro';
      credits = 100;
    }

    console.log(`[Paddle] Actualizando usuario: ${customerEmail} → ${planType} (${credits} créditos)`);

    // Actualizar o crear usuario
    const user = await db.user.upsert({
      where: { email: customerEmail.toLowerCase() },
      update: {
        planType,
        credits
      },
      create: {
        email: customerEmail.toLowerCase(),
        name: data.customer?.name || customerEmail.split('@')[0],
        password: 'paddle_user_' + Date.now(), // Placeholder, no se usará
        planType,
        credits
      }
    });

    console.log(`[Paddle] Usuario actualizado: ${user.email} → ${user.planType}`);

  } catch (error) {
    console.error("[Paddle] Error en handlePaymentSuccess:", error);
    throw error;
  }
}

async function handleSubscriptionCancelled(data: any) {
  try {
    const customerEmail = data.customer?.email;
    
    if (!customerEmail) return;

    // Degradar a plan gratuito
    await db.user.update({
      where: { email: customerEmail.toLowerCase() },
      data: {
        planType: 'free',
        credits: 3
      }
    });

    console.log(`[Paddle] Suscripción cancelada: ${customerEmail} → free`);

  } catch (error) {
    console.error("[Paddle] Error en handleSubscriptionCancelled:", error);
  }
}

async function handleSubscriptionRenewed(data: any) {
  try {
    const customerEmail = data.customer?.email;
    const priceId = data.items?.[0]?.price?.id;
    
    if (!customerEmail) return;

    // Resetear créditos según el plan
    const credits = priceId?.includes('enterprise') ? -1 : 100;
    
    await db.user.update({
      where: { email: customerEmail.toLowerCase() },
      data: { credits }
    });

    console.log(`[Paddle] Suscripción renovada: ${customerEmail} → ${credits} créditos`);

  } catch (error) {
    console.error("[Paddle] Error en handleSubscriptionRenewed:", error);
  }
}

function extractEmailFromPassthrough(passthrough: string | undefined): string | null {
  if (!passthrough) return null;
  
  try {
    // Intentar parsear como JSON
    const parsed = JSON.parse(passthrough);
    return parsed.email || parsed.user_email || null;
  } catch {
    // Si no es JSON, buscar patrón de email
    const emailMatch = passthrough.match(/[\w.-]+@[\w.-]+\.\w+/);
    return emailMatch ? emailMatch[0] : null;
  }
}

// GET para verificar que el webhook funciona
export async function GET() {
  return NextResponse.json({
    status: "Paddle webhook active",
    timestamp: new Date().toISOString()
  });
}
