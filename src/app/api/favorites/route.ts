import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Obtener favoritos del usuario
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("ntm_session")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("type"); // business, report, analysis
    const folder = searchParams.get("folder");

    const where: Record<string, unknown> = { userId };
    if (itemType) where.itemType = itemType;
    if (folder) where.folder = folder;

    const favorites = await db.favorite.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50
    });

    // Parsear itemData de JSON
    const parsedFavorites = favorites.map(f => ({
      ...f,
      itemData: JSON.parse(f.itemData)
    }));

    return NextResponse.json({
      success: true,
      data: parsedFavorites
    });

  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Error al obtener favoritos" }, { status: 500 });
  }
}

// POST - Agregar a favoritos
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("ntm_session")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { itemType, itemId, itemData, folder, notes } = body;

    if (!itemType || !itemId || !itemData) {
      return NextResponse.json({ 
        error: "Faltan datos requeridos: itemType, itemId, itemData" 
      }, { status: 400 });
    }

    // Verificar si ya existe
    const existing = await db.favorite.findFirst({
      where: {
        userId,
        itemType,
        itemId
      }
    });

    if (existing) {
      return NextResponse.json({ 
        error: "Este item ya está en favoritos",
        favorite: existing
      }, { status: 400 });
    }

    const favorite = await db.favorite.create({
      data: {
        userId,
        itemType,
        itemId,
        itemData: JSON.stringify(itemData),
        folder,
        notes
      }
    });

    return NextResponse.json({
      success: true,
      message: "Agregado a favoritos",
      data: favorite
    });

  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Error al agregar favorito" }, { status: 500 });
  }
}

// DELETE - Eliminar de favoritos
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.cookies.get("ntm_session")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get("id");

    if (!favoriteId) {
      return NextResponse.json({ error: "ID de favorito requerido" }, { status: 400 });
    }

    // Verificar que pertenece al usuario
    const favorite = await db.favorite.findFirst({
      where: { id: favoriteId, userId }
    });

    if (!favorite) {
      return NextResponse.json({ error: "Favorito no encontrado" }, { status: 404 });
    }

    await db.favorite.delete({
      where: { id: favoriteId }
    });

    return NextResponse.json({
      success: true,
      message: "Eliminado de favoritos"
    });

  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json({ error: "Error al eliminar favorito" }, { status: 500 });
  }
}

// PATCH - Actualizar favorito (agregar notas, cambiar carpeta)
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.cookies.get("ntm_session")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, notes, folder } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de favorito requerido" }, { status: 400 });
    }

    // Verificar que pertenece al usuario
    const favorite = await db.favorite.findFirst({
      where: { id, userId }
    });

    if (!favorite) {
      return NextResponse.json({ error: "Favorito no encontrado" }, { status: 404 });
    }

    const updated = await db.favorite.update({
      where: { id },
      data: {
        ...(notes !== undefined && { notes }),
        ...(folder !== undefined && { folder })
      }
    });

    return NextResponse.json({
      success: true,
      message: "Favorito actualizado",
      data: updated
    });

  } catch (error) {
    console.error("Error updating favorite:", error);
    return NextResponse.json({ error: "Error al actualizar favorito" }, { status: 500 });
  }
}
