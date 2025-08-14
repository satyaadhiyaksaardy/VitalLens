import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const CreateReadingSchema = z.object({
  measuredAt: z.string().transform((str) => new Date(str)),
  heightCm: z.number().nullable().optional(),
  weightKg: z.number().nullable().optional(),
  bmi: z.number().nullable().optional(),
  standardWeightKg: z.number().nullable().optional(),
  systolic: z.number().nullable().optional(),
  diastolic: z.number().nullable().optional(),
  pulse: z.number().nullable().optional(),
  sourceImages: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateReadingSchema.parse(body);

    const reading = await prisma.reading.create({
      data: {
        ...validated,
        sourceImages: JSON.stringify(validated.sourceImages || []),
      },
    });

    return NextResponse.json({
      ...reading,
      sourceImages: JSON.parse(reading.sourceImages),
    });
  } catch (error) {
    console.error("Error creating reading:", error);
    return NextResponse.json({ error: "Failed to create reading" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");

    const where: any = {};

    if (startDate || endDate) {
      where.measuredAt = {};
      if (startDate) {
        where.measuredAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.measuredAt.lte = new Date(endDate);
      }
    }

    const readings = await prisma.reading.findMany({
      where,
      orderBy: { measuredAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(
      readings.map((r) => ({
        ...r,
        sourceImages: JSON.parse(r.sourceImages),
      }))
    );
  } catch (error) {
    console.error("Error fetching readings:", error);
    return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 });
  }
}
