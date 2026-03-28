import { NextRequest, NextResponse } from "next/server";

// MercadoPago Integration for Argentina
// Documentation: https://www.mercadopago.com.ar/developers

interface PreferenceItem {
  id: string;
  title: string;
  description: string;
  category_id: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
}

interface PreferencePayload {
  items: PreferenceItem[];
  payer: {
    email: string;
    name?: string;
    surname?: string;
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  notification_url: string;
  external_reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, userId, email } = body;

    // Planes disponibles (precios en ARS - Pesos Argentinos)
    const plans = {
      free: { price: 0, name: "Gratis", credits: 3 },
      pro: { price: 8700, name: "Pro", credits: 100 }, // ~USD 29 en ARS (aprox)
      enterprise: { price: 29700, name: "Empresa", credits: -1 } // ~USD 99 en ARS
    };

    const selectedPlan = plans[planType as keyof typeof plans];
    
    if (!selectedPlan || selectedPlan.price === 0) {
      return NextResponse.json(
        { error: "Invalid plan or free plan selected" },
        { status: 400 }
      );
    }

    // Crear preferencia de pago para MercadoPago
    const preferenceData: PreferencePayload = {
      items: [
        {
          id: planType,
          title: `NTM - Plan ${selectedPlan.name}`,
          description: `Suscripción mensual a Next Trends Monitor - Plan ${selectedPlan.name}`,
          category_id: "services",
          quantity: 1,
          currency_id: "ARS",
          unit_price: selectedPlan.price
        }
      ],
      payer: {
        email: email || "cliente@example.com"
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/pending`
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/mercadopago`,
      external_reference: userId || `user_${Date.now()}`
    };

    // En producción, llamar a la API de MercadoPago:
    // const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
    //   },
    //   body: JSON.stringify(preferenceData)
    // });
    // const preference = await response.json();

    // Por ahora, simular respuesta para desarrollo
    const mockPreferenceId = `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockInitPoint = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref-id=${mockPreferenceId}`;

    return NextResponse.json({
      success: true,
      preference: {
        id: mockPreferenceId,
        init_point: mockInitPoint,
        sandbox_init_point: mockInitPoint,
        plan: selectedPlan,
        amount: selectedPlan.price,
        currency: "ARS"
      },
      message: "Preferencia de pago creada correctamente"
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { 
        error: "Error creating payment preference",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
