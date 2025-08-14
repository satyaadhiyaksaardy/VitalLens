import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reading = await prisma.reading.findUnique({
      where: { id: params.id },
    });

    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...reading,
      sourceImages: JSON.parse(reading.sourceImages),
    });
  } catch (error) {
    console.error("Error fetching reading:", error);
    return NextResponse.json({ error: "Failed to fetch reading" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.reading.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reading:", error);
    return NextResponse.json({ error: "Failed to delete reading" }, { status: 500 });
  }
}
