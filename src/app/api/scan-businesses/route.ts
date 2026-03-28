import { NextRequest, NextResponse } from "next/server";

// Google Places API - GRATIS con $200/mes (~40,000 llamadas)
// https://console.cloud.google.com/apis/library

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  opening_hours?: { open_now: boolean };
  photos?: { photo_reference: string }[];
  international_phone_number?: string;
  website?: string;
  vicinity?: string;
  business_status?: string;
}

interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
  error_message?: string;
}

// Buscar negocios con Google Places API
async function searchGooglePlaces(location: string, category: string, limit: number = 20): Promise<{
  businesses: any[];
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY;

  try {
    // Mapear categorías a tipos de Google Places
    const typeMapping: Record<string, string> = {
      restaurant: "restaurant",
      store: "store",
      service: "establishment",
      health: "health",
      all: "establishment"
    };

    const placeType = typeMapping[category] || "establishment";

    // Usar Text Search de Places API
    const query = category !== "all" 
      ? `${category} in ${location}` 
      : `businesses in ${location}`;

    const params = new URLSearchParams({
      query: query,
      type: placeType,
      key: apiKey,
      language: "es"
    });

    console.log(`[Places] Searching: ${query}`);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`,
      { next: { revalidate: 300 } } // Cache 5 minutos
    );

    if (!response.ok) {
      console.error(`[Places] API error: ${response.status}`);
      return { businesses: [], error: `Error de API: ${response.status}` };
    }

    const data: GooglePlacesResponse = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error(`[Places] Status: ${data.status}, Error: ${data.error_message}`);
      return { businesses: [], error: data.error_message || data.status };
    }

    if (!data.results || data.results.length === 0) {
      console.log("[Places] No results found");
      return { businesses: [] };
    }

    // Obtener detalles de cada lugar (máximo 10 para no gastar cuota)
    const placesToDetail = data.results.slice(0, Math.min(limit, 15));
    
    const detailedPlaces = await Promise.all(
      placesToDetail.map(async (place) => {
        try {
          const detailsParams = new URLSearchParams({
            place_id: place.place_id,
            fields: "name,formatted_address,geometry,rating,user_ratings_total,price_level,types,opening_hours,photos,international_phone_number,website,opening_hours,business_status",
            key: apiKey
          });

          const detailResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?${detailsParams}`,
            { next: { revalidate: 86400 } } // Cache 24 horas para detalles
          );

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            return detailData.result || place;
          }
          return place;
        } catch {
          return place;
        }
      })
    );

    // Formatear resultados
    const businesses = detailedPlaces.map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity || "Dirección no disponible",
      phone: place.international_phone_number || null,
      website: place.website || null,
      rating: place.rating || null,
      reviewCount: place.user_ratings_total || 0,
      price: place.price_level ? "$".repeat(place.price_level) : null,
      businessType: formatTypes(place.types),
      isOpen: place.opening_hours?.open_now ?? null,
      businessStatus: place.business_status || "OPERATIONAL",
      coordinates: place.geometry?.location || null,
      photo: place.photos?.[0]?.photo_reference 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
        : null,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      issues: analyzeIssues(place),
      source: "Google Places",
      hasRealData: true
    }));

    console.log(`[Places] Found ${businesses.length} businesses with real data`);
    return { businesses };

  } catch (error) {
    console.error("[Places] Error:", error);
    return { businesses: [], error: "Error al buscar negocios" };
  }
}

// Formatear tipos de negocio
function formatTypes(types: string[]): string {
  if (!types || types.length === 0) return "General";
  
  const typeNames: Record<string, string> = {
    restaurant: "Restaurante",
    food: "Comida",
    store: "Tienda",
    health: "Salud",
    hospital: "Hospital",
    doctor: "Consultorio",
    dentist: "Dentista",
    gym: "Gimnasio",
    spa: "Spa",
    beauty_salon: "Salón de Belleza",
    hair_care: "Peluquería",
    car_repair: "Taller Mecánico",
    lodging: "Hotel",
    cafe: "Cafetería",
    bar: "Bar",
    bakery: "Panadería",
    convenience_store: "Tienda de Conveniencia",
    clothing_store: "Tienda de Ropa",
    electronics_store: "Tienda de Electrónicos",
    furniture_store: "Tienda de Muebles",
    finance: "Finanzas",
    bank: "Banco",
    lawyer: "Abogado",
    real_estate_agency: "Inmobiliaria",
    travel_agency: "Agencia de Viajes",
    school: "Escuela",
    university: "Universidad",
    establishment: "Negocio",
    point_of_interest: "Punto de Interés"
  };

  for (const type of types) {
    if (typeNames[type]) {
      return typeNames[type];
    }
  }

  return types[0]?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "General";
}

// Analizar problemas del negocio
function analyzeIssues(place: GooglePlace): string[] {
  const issues: string[] = [];

  // Sin sitio web
  if (!place.website) {
    issues.push("🚨 Sin sitio web");
  }

  // Sin teléfono
  if (!place.international_phone_number) {
    issues.push("📞 Sin teléfono visible");
  }

  // Rating bajo
  if (place.rating && place.rating < 3.5) {
    issues.push(`⭐ Rating bajo (${place.rating})`);
  }

  // Pocas reseñas
  if (!place.user_ratings_total || place.user_ratings_total < 10) {
    issues.push("📝 Pocas reseñas");
  }

  // Cerrado permanentemente
  if (place.business_status === "CLOSED_PERMANENTLY") {
    issues.push("🔴 Cerrado permanentemente");
  }

  // Cerrado temporalmente
  if (place.business_status === "CLOSED_TEMPORARILY") {
    issues.push("🟡 Cerrado temporalmente");
  }

  // Sin fotos
  if (!place.photos || place.photos.length === 0) {
    issues.push("📷 Sin fotos");
  }

  // Sin horarios
  if (!place.opening_hours) {
    issues.push("🕐 Sin horarios");
  }

  // Si todo está bien
  if (issues.length === 0) {
    issues.push("✅ Perfil completo");
  }

  return issues;
}

// Fallback con DuckDuckGo
async function searchDuckDuckGo(query: string) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
    const response = await fetch(url);
    const data = await response.json();

    const results = [];
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            name: topic.Text.slice(0, 100),
            snippet: topic.Text,
            url: topic.FirstURL
          });
        }
      }
    }
    return results;
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, businessType } = body;

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    console.log(`[Scanner] Buscando en: ${location}, tipo: ${businessType || 'all'}`);

    // Intentar Google Places primero
    const { businesses, error } = await searchGooglePlaces(location, businessType || "all", 15);

    if (businesses.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          businesses,
          summary: `Se encontraron ${businesses.length} negocios REALES en Google Places para "${location}". Datos verificados con ratings, horarios y contacto.`,
          location,
          totalFound: businesses.length,
          dataSource: "Google Places API",
          hasRealData: true
        },
        timestamp: new Date().toISOString()
      });
    }

    // Fallback a DuckDuckGo si no hay API key o error
    if (error?.includes("API Key")) {
      console.log("[Scanner] No API key, using DuckDuckGo fallback");
    }

    const ddgResults = await searchDuckDuckGo(`${businessType !== "all" ? businessType : "negocios"} ${location}`);

    if (ddgResults.length > 0) {
      const fallbackBusinesses = ddgResults.slice(0, 10).map((r, i) => ({
        id: `ddg_${i}`,
        name: r.name,
        address: location,
        phone: null,
        website: r.url,
        rating: null,
        reviewCount: null,
        businessType: businessType !== "all" ? businessType : "General",
        issues: ["Verificar información", "Sin datos de contacto"],
        source: "DuckDuckGo",
        snippet: r.snippet,
        hasRealData: false
      }));

      return NextResponse.json({
        success: true,
        data: {
          businesses: fallbackBusinesses,
          summary: `${fallbackBusinesses.length} resultados. Para datos completos, configura GOOGLE_API_KEY en tu archivo .env`,
          location,
          totalFound: fallbackBusinesses.length,
          dataSource: "DuckDuckGo (limitado)",
          hasRealData: false,
          configHelp: "Obtén tu API Key gratuita en: https://console.cloud.google.com/apis/credentials"
        },
        timestamp: new Date().toISOString()
      });
    }

    // Sin resultados
    return NextResponse.json({
      success: true,
      data: {
        businesses: [],
        summary: `No se encontraron negocios para "${location}". Intenta con otra ubicación.`,
        location,
        totalFound: 0,
        dataSource: "Sin resultados",
        hasRealData: false,
        configHelp: error?.includes("API Key") 
          ? "Obtén tu API Key gratuita en: https://console.cloud.google.com/apis/credentials"
          : undefined
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Scanner error:", error);
    return NextResponse.json(
      { error: "Error scanning businesses", details: String(error) },
      { status: 500 }
    );
  }
}

// GET para documentación
export async function GET() {
  return NextResponse.json({
    name: "Scanner de Negocios - Google Places API",
    description: "Encuentra negocios con datos reales",
    endpoints: {
      "POST /api/scan-businesses": {
        parameters: {
          location: "string (required) - Ciudad o dirección",
          businessType: "string (optional) - restaurant, store, service, health, all"
        }
      }
    },
    setup: {
      step1: "Ve a https://console.cloud.google.com/apis/library",
      step2: "Activa 'Places API'",
      step3: "Ve a https://console.cloud.google.com/apis/credentials",
      step4: "Crea una API Key y cópiala en .env como GOOGLE_API_KEY"
    },
    freeQuota: "$200/mes gratis = ~40,000 búsquedas"
  });
}
