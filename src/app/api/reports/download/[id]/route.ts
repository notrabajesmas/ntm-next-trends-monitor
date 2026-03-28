import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Sanitize the ID to prevent directory traversal
    const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    
    if (!sanitizedId) {
      return NextResponse.json(
        { error: "Invalid report ID" },
        { status: 400 }
      );
    }

    const pdfPath = path.join(process.cwd(), "download", `${sanitizedId}.pdf`);
    
    try {
      const pdfBuffer = await fs.readFile(pdfPath);
      
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="NTM_Report_${sanitizedId}.pdf"`,
          "Cache-Control": "no-cache"
        }
      });
    } catch {
      return NextResponse.json(
        { error: "Report not found or expired" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Error downloading report" },
      { status: 500 }
    );
  }
}
