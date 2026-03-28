import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1 as test`;
    
    // Count users
    const userCount = await db.user.count();
    
    return NextResponse.json({
      status: "connected",
      database: "PostgreSQL (Neon)",
      users: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: String(error),
      hasDbUrl: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
