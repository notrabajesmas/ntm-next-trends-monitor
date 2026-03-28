import { NextRequest, NextResponse } from "next/server";

// Paddle Integration - Production Ready
// Price IDs configurados desde el dashboard de Paddle

const PADDLE_PRICES = {
  pro: {
    id: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || "pri_01km5a0xnesah58qp21ekn4xrr",
    name: "Pro Plan",
    price: "$29",
    period: "/month",
    features: [
      "100 analyses per month",
      "Deep AI analysis", 
      "Unlimited PDF reports",
      "Export to CSV"
    ]
  },
  enterprise: {
    id: process.env.NEXT_PUBLIC_PADDLE_ENTERPRISE_PRICE_ID || "pri_01km5a65d2t8jy65s00qkscpa1",
    name: "Enterprise Plan", 
    price: "$99",
    period: "/month",
    features: [
      "Unlimited analyses",
      "API access",
      "Priority support",
      "White-label available"
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, email, userId } = body;

    // Validar plan
    const plan = PADDLE_PRICES[planType as keyof typeof PADDLE_PRICES];
    
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan. Use 'pro' or 'enterprise'" },
        { status: 400 }
      );
    }

    // Usar el client token de Paddle
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    
    if (!clientToken) {
      return NextResponse.json(
        { error: "Paddle not configured" },
        { status: 500 }
      );
    }

    // Devolver información para el checkout del frontend
    return NextResponse.json({
      success: true,
      checkout: {
        priceId: plan.id,
        customerEmail: email,
        customData: { 
          userId,
          planType 
        }
      },
      plan: {
        name: plan.name,
        price: plan.price,
        period: plan.period
      }
    });

  } catch (error) {
    console.error("Paddle checkout error:", error);
    return NextResponse.json(
      { 
        error: "Error creating checkout",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    plans: PADDLE_PRICES
  });
}
