import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// API Pública v1 - Scanner de Negocios con Google Places
// Documentación: GET /api/v1/scanner

interface ApiKeyValidation {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    planType: string;
    credits: number;
  };
  error?: string;
}

// Validar API Key
async function validateApiKey(apiKey: string): Promise<ApiKeyValidation> {
  if (!apiKey || !apiKey.startsWith('ntm_')) {
    return { valid: false, error: "Invalid API key format" };
  }

  const user = await db.user.findFirst({
    where: {
      OR: [
        { email: apiKey.replace('ntm_live_', '').replace('ntm_test_', '').replace('_', '@') },
        { id: apiKey.split('_').pop() }
      ]
    },
    select: { id: true, email: true, planType: true, credits: true }
  });

  if (!user) {
    return { valid: false, error: "API key not found" };
  }

  if (user.planType !== 'enterprise' && (user.credits ?? 0) <= 0) {
    return { valid: false, error: "No credits available" };
  }

  return { valid: true, user };
}

// Descontar crédito
async function consumeApiCredit(userId: string, planType: string): Promise<boolean> {
  if (planType === 'enterprise') return true;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  });

  if (!user || (user.credits ?? 0) <= 0) return false;

  await db.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } }
  });

  return true;
}

// Google Places Search
async function searchGooglePlaces(location: string, category: string, limit: number) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY_HERE') {
    return { businesses: [], error: "Google API Key not configured" };
  }

  try {
    const query = category !== "all" && category 
      ? `${category} in ${location}` 
      : `businesses in ${location}`;

    const params = new URLSearchParams({
      query,
      key: apiKey,
      language: "es"
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`,
      { next: { revalidate: 300 } }
    );

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return { businesses: [], error: data.error_message || data.status };
    }

    const places = data.results?.slice(0, limit) || [];

    const businesses = places.map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || null,
      reviewCount: place.user_ratings_total || 0,
      priceLevel: place.price_level ? "$".repeat(place.price_level) : null,
      types: place.types || [],
      isOpen: place.opening_hours?.open_now ?? null,
      coordinates: place.geometry?.location || null,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
    }));

    return { businesses };
  } catch (error) {
    return { businesses: [], error: String(error) };
  }
}

// GET - Documentación
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("api_key") || request.headers.get("X-API-Key");

  if (!apiKey) {
    return NextResponse.json({
      name: "NTM Public API - Scanner",
      version: "1.1.0",
      description: "API pública para análisis de negocios locales con Google Places",
      poweredBy: "Google Places API",
      endpoints: {
        "POST /api/v1/scanner": {
          description: "Buscar negocios en una zona geográfica",
          parameters: {
            location: "string (required) - Zona geográfica (ej: 'Madrid, España')",
            category: "string (optional) - restaurant, store, service, health",
            limit: "number (optional) - Máximo de resultados (default: 20)"
          },
          response: {
            businesses: "Array de negocios con datos reales",
            placeId: "ID único de Google Places",
            name: "Nombre del negocio",
            address: "Dirección completa",
            rating: "Rating (0-5)",
            reviewCount: "Número de reseñas",
            googleMapsUrl: "Link a Google Maps"
          }
        }
      },
      authentication: {
        type: "API Key",
        header: "X-API-Key",
        format: "ntm_live_email o ntm_live_userId"
      },
      pricing: {
        free: { credits: 3, price: "$0" },
        pro: { credits: 100, price: "$29/mes" },
        enterprise: { credits: "ilimitado", price: "$99/mes" }
      }
    });
  }

  const validation = await validateApiKey(apiKey);

  if (!validation.valid) {
    return NextResponse.json({ error: "Unauthorized", message: validation.error }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      email: validation.user?.email,
      plan: validation.user?.planType,
      credits: validation.user?.planType === 'enterprise' ? 'unlimited' : validation.user?.credits
    }
  });
}

// POST - Ejecutar scanner
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("X-API-Key") ||
                   new URL(request.url).searchParams.get("api_key");

    const validation = await validateApiKey(apiKey || '');

    if (!validation.valid || !validation.user) {
      return NextResponse.json({
        error: "Unauthorized",
        message: validation.error || "API key required"
      }, { status: 401 });
    }

    const body = await request.json();
    const { location, category, limit = 20 } = body;

    if (!location) {
      return NextResponse.json({
        error: "Bad Request",
        message: "location is required"
      }, { status: 400 });
    }

    // Consumir crédito
    const consumed = await consumeApiCredit(validation.user.id, validation.user.planType);

    if (!consumed) {
      return NextResponse.json({
        error: "Payment Required",
        message: "No credits available. Upgrade your plan."
      }, { status: 402 });
    }

    // Ejecutar búsqueda con Google Places
    const { businesses, error } = await searchGooglePlaces(location, category, limit);

    // Guardar en historial
    await db.analysisRequest.create({
      data: {
        userId: validation.user.id,
        toolType: "scanner",
        inputData: JSON.stringify({ location, category, limit }),
        status: businesses.length > 0 ? "completed" : "failed",
        rawData: JSON.stringify({ businesses, error }),
        creditsUsed: 1
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        location,
        businesses,
        totalFound: businesses.length,
        dataSource: businesses.length > 0 ? "Google Places API" : "No results"
      },
      meta: {
        creditsRemaining: validation.user.planType === 'enterprise'
          ? 'unlimited'
          : (validation.user.credits - 1),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({
      error: "Internal Server Error",
      message: String(error)
    }, { status: 500 });
  }
}
