import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Webhook para recibir notificaciones de MercadoPago
// MercadoPago envía notificaciones cuando un pago cambia de estado

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // MercadoPago envía datos en este formato
    const { type, data } = body;
    
    console.log("MercadoPago Webhook received:", { type, data });

    if (type === "payment") {
      const paymentId = data?.id;
      
      // En producción, verificar el pago con la API de MercadoPago:
      // const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      //   headers: {
      //     "Authorization": `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      //   }
      // });
      // const payment = await response.json();
      
      // Por ahora, simulamos un pago aprobado
      const mockPayment = {
        id: paymentId,
        status: "approved",
        external_reference: data?.external_reference,
        payer: { email: "cliente@example.com" }
      };

      if (mockPayment.status === "approved") {
        // Aquí actualizarías el usuario en la base de datos
        // await db.user.update({
        //   where: { id: mockPayment.external_reference },
        //   data: {
        //     planType: "pro",
        //     credits: 100
        //   }
        // });
        
        console.log(`Payment ${paymentId} approved, user upgraded to Pro`);
      }
    }

    return NextResponse.json({ 
      status: "ok",
      received: true 
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic");
  const id = searchParams.get("id");

  // Verificación inicial de MercadoPago
  console.log(`Webhook verification: topic=${topic}, id=${id}`);
  
  return NextResponse.json({ 
    status: "ok",
    topic,
    id
  });
}
