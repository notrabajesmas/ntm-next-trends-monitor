"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

// Paddle Provider Component
// Inicializa Paddle con el client token

declare global {
  interface Window {
    Paddle?: Paddle;
  }
}

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initPaddle = async () => {
      try {
        // Usar el client token de Paddle
        const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
        
        if (!clientToken) {
          console.warn("Paddle client token not configured");
          setIsLoading(false);
          return;
        }

        // Inicializar Paddle
        const paddleInstance = await initializePaddle({
          environment: "production", // Cambiar a 'sandbox' para pruebas
          token: clientToken,
        });
        
        setPaddle(paddleInstance);
        console.log("✅ Paddle initialized");
      } catch (error) {
        console.error("Failed to initialize Paddle:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPaddle();
  }, []);

  return { paddle, isLoading };
}

// Hook para abrir el checkout de Paddle
export function usePaddleCheckout() {
  const { paddle, isLoading } = usePaddle();

  const openCheckout = (options: {
    priceId: string;
    email?: string;
    customData?: Record<string, string>;
    successUrl?: string;
  }) => {
    if (!paddle) {
      console.error("Paddle not initialized");
      return;
    }

    paddle.Checkout.open({
      items: [
        {
          priceId: options.priceId,
          quantity: 1,
        },
      ],
      customer: options.email
        ? {
            email: options.email,
          }
        : undefined,
      customData: options.customData,
      successUrl: options.successUrl || `${window.location.origin}/success`,
    });
  };

  return { openCheckout, isLoading, isReady: !!paddle };
}
