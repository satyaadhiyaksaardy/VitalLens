import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-api";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const reading = await prisma.reading.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id // Ensure user can only access their own readings
      },
    });

    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...reading,
      sourceImages: JSON.parse(reading.sourceImages),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Error fetching reading:", error);
    return NextResponse.json({ error: "Failed to fetch reading" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await prisma.reading.deleteMany({
      where: { 
        id: params.id,
        userId: session.user.id // Ensure user can only delete their own readings
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Error deleting reading:", error);
    return NextResponse.json({ error: "Failed to delete reading" }, { status: 500 });
  }
}
