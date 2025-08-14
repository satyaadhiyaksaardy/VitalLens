import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth-api";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    await requireAuth();
    
    const filename = params.filename;
    const filepath = path.join(process.cwd(), "uploads", "meals", filename);
    
    const imageBuffer = await readFile(filepath);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg";
    
    switch (ext) {
      case ".png":
        contentType = "image/png";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      default:
        contentType = "image/jpeg";
    }
    
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Error serving meal image:", error);
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}