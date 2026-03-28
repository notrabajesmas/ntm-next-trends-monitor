import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Paddle Webhook Handler - Production Ready
// Maneja todos los eventos de Paddle

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Paddle envía eventos con esta estructura
    const eventType = body.event_type || body.eventType;
    const data = body.data;
    
    console.log(`🛒 Paddle Webhook: ${eventType}`);

    switch (eventType) {
      case "transaction.completed":
        await handleTransactionCompleted(data);
        break;
        
      case "subscription.created":
        await handleSubscriptionCreated(data);
        break;
        
      case "subscription.updated":
        await handleSubscriptionUpdated(data);
        break;
        
      case "subscription.cancelled":
      case "subscription.canceled":
        await handleSubscriptionCancelled(data);
        break;
        
      case "subscription.past_due":
        await handleSubscriptionPastDue(data);
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ 
      success: true,
      processed: true,
      event: eventType 
    });

  } catch (error) {
    console.error("❌ Paddle webhook error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Webhook processing failed" 
      },
      { status: 500 }
    );
  }
}

async function handleTransactionCompleted(data: any) {
  try {
    const customData = data.custom_data || data.customData || {};
    const email = data.customer?.email || data.billing?.email;
    const transactionId = data.id;
    
    console.log(`✅ Transaction completed: ${transactionId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Custom data:`, customData);

    // Si tenemos userId, actualizar el usuario
    if (customData.userId) {
      await db.user.update({
        where: { id: customData.userId },
        data: {
          planType: customData.planType || "pro",
          credits: 100,
          stripeCustomerId: data.customer_id || data.customer?.id,
          stripeSubscriptionId: data.subscription_id || data.subscription?.id,
          updatedAt: new Date()
        }
      });
      console.log(`   User updated: ${customData.userId}`);
    } else if (email) {
      // Buscar usuario por email y actualizar
      const user = await db.user.findUnique({
        where: { email }
      });
      
      if (user) {
        await db.user.update({
          where: { email },
          data: {
            planType: customData.planType || "pro",
            credits: 100,
            stripeCustomerId: data.customer_id || data.customer?.id,
            stripeSubscriptionId: data.subscription_id || data.subscription?.id,
            updatedAt: new Date()
          }
        });
        console.log(`   User updated by email: ${email}`);
      }
    }
  } catch (error) {
    console.error("Error in handleTransactionCompleted:", error);
  }
}

async function handleSubscriptionCreated(data: any) {
  console.log(`📝 Subscription created: ${data.id}`);
}

async function handleSubscriptionUpdated(data: any) {
  console.log(`🔄 Subscription updated: ${data.id}`);
}

async function handleSubscriptionCancelled(data: any) {
  try {
    const customData = data.custom_data || data.customData || {};
    
    // Revertir a plan free
    if (customData.userId) {
      await db.user.update({
        where: { id: customData.userId },
        data: {
          planType: "free",
          credits: 3,
          updatedAt: new Date()
        }
      });
      console.log(`❌ Subscription cancelled, user reverted: ${customData.userId}`);
    }
  } catch (error) {
    console.error("Error in handleSubscriptionCancelled:", error);
  }
}

async function handleSubscriptionPastDue(data: any) {
  console.log(`⚠️ Subscription past due: ${data.id}`);
}

// Health check
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: "ok",
    service: "Paddle Webhook - NTM",
    timestamp: new Date().toISOString()
  });
}
