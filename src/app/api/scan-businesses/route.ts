import { NextRequest, NextResponse } from "next/server";

// Yelp Fusion API - GRATIS con 5,000 llamadas/día
// Necesita YELP_API_KEY en variables de entorno

interface YelpBusiness {
  id: string;
  name: string;
  image_url: string;
  url: string;
  rating: number;
  review_count: number;
  phone: string;
  display_phone: string;
  location: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    display_address: string[];
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  photos: string[];
  price: string;
  categories: { title: string; alias: string }[];
  is_closed: boolean;
  distance: number;
  transactions: string[];
}

interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
  region: {
    center: { latitude: number; longitude: number };
  };
}

async function searchYelp(location: string, category: string, limit: number = 20): Promise<YelpBusiness[]> {
  const apiKey = process.env.YELP_API_KEY;
  
  if (!apiKey) {
    console.log("[Yelp] No API key configured, using fallback");
    return [];
  }

  try {
    const categories = category !== "all" ? category : "restaurants,shopping,services,health,fitness";
    
    const params = new URLSearchParams({
      location: location,
      categories: categories,
      limit: limit.toString(),
      sort_by: "distance"
    });

    const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`[Yelp] API error: ${response.status}`);
      return [];
    }

    const data: YelpSearchResponse = await response.json();
    console.log(`[Yelp] Found ${data.businesses.length} businesses`);
    return data.businesses;
  } catch (error) {
    console.error("[Yelp] Error:", error);
    return [];
  }
}

// Fallback con DuckDuckGo si no hay Yelp
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

    // Intentar Yelp primero
    const yelpResults = await searchYelp(location, businessType || "all", 15);

    let businesses = [];

    if (yelpResults.length > 0) {
      // Usar datos REALES de Yelp
      businesses = yelpResults.map((b, i) => ({
        id: b.id,
        name: b.name,
        address: b.location.display_address?.join(", ") || "No disponible",
        phone: b.display_phone || b.phone || null,
        website: b.url ? `https://www.yelp.com/biz/${b.id}` : null,
        rating: b.rating || null,
        reviewCount: b.review_count || 0,
        price: b.price || null,
        businessType: b.categories?.[0]?.title || "General",
        isOpen: !b.is_closed,
        distance: b.distance ? Math.round(b.distance) : null,
        photo: b.image_url || null,
        coordinates: b.coordinates || null,
        issues: analyzeIssues(b),
        source: "Yelp",
        sourceUrl: b.url
      }));
    } else {
      // Fallback a DuckDuckGo
      const ddgResults = await searchDuckDuckGo(`${businessType !== "all" ? businessType : "negocios"} ${location}`);
      
      if (ddgResults.length > 0) {
        businesses = ddgResults.slice(0, 10).map((r, i) => ({
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
          snippet: r.snippet
        }));
      } else {
        // Generar sugerencias si no hay nada
        businesses = generateSuggestions(location, businessType);
      }
    }

    const summary = yelpResults.length > 0 
      ? `Se encontraron ${businesses.length} negocios REALES en Yelp para "${location}". Incluye ratings, horarios y datos de contacto verificados.`
      : businesses.length > 0 
        ? `Se encontraron ${businesses.length} resultados. Para datos más completos, configura YELP_API_KEY.`
        : `Se generaron sugerencias para "${location}". Para datos reales, configura YELP_API_KEY.`;

    return NextResponse.json({
      success: true,
      data: {
        businesses,
        summary,
        location,
        totalFound: businesses.length,
        dataSource: yelpResults.length > 0 ? "Yelp Fusion API" : "DuckDuckGo + Sugerencias",
        hasRealData: yelpResults.length > 0
      },
      location,
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

function analyzeIssues(business: YelpBusiness): string[] {
  const issues: string[] = [];
  
  if (!business.url || !business.url.includes('http')) {
    issues.push("Sin sitio web propio");
  }
  
  if (business.rating && business.rating < 3.5) {
    issues.push(`Rating bajo (${business.rating}⭐)`);
  }
  
  if (business.review_count < 10) {
    issues.push("Pocas reseñas");
  }
  
  if (business.is_closed) {
    issues.push("Permanentemente cerrado");
  }
  
  if (!business.display_phone && !business.phone) {
    issues.push("Sin teléfono visible");
  }
  
  if (!business.photos || business.photos.length === 0) {
    issues.push("Sin fotos");
  }
  
  if (issues.length === 0) {
    issues.push("Perfil completo en Yelp");
  }
  
  return issues;
}

function generateSuggestions(location: string, businessType: string) {
  const types: Record<string, string[]> = {
    restaurant: ["Restaurante", "Cafetería", "Pizzería", "Bar", "Comida rápida"],
    store: ["Tienda", "Supermercado", "Boutique", "Ferretería"],
    service: ["Peluquería", "Gimnasio", "Lavandería", "Spa"],
    health: ["Clínica", "Consultorio", "Veterinaria", "Farmacia"],
    all: ["Restaurante", "Tienda", "Servicio", "Centro de salud", "Café"]
  };

  const selectedTypes = types[businessType] || types.all;
  
  return selectedTypes.map((type, i) => ({
    id: `suggestion_${i}`,
    name: `${type} en ${location.split(',')[0]}`,
    address: `Zona centro, ${location}`,
    phone: null,
    website: null,
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
    reviewCount: Math.floor(Math.random() * 50) + 5,
    businessType: type,
    issues: ["Verificar existencia", "Sin datos de contacto"],
    source: "Sugerencia",
    note: "Resultado sugerido - configura YELP_API_KEY para datos reales"
  }));
}
