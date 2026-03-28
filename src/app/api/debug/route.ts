import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + "..." : "NOT SET",
    dbUrlLength: process.env.DATABASE_URL?.length || 0,
  };

  // Try to connect
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      ...diagnostics,
      connection: "SUCCESS",
      queryResult: result,
      userCount,
    });
  } catch (error) {
    return NextResponse.json({
      ...diagnostics,
      connection: "FAILED",
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack?.split("\n").slice(0, 5) : undefined,
    }, { status: 500 });
  }
}
