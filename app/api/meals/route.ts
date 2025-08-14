import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-api";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const CreateMealSchema = z.object({
  eatenAt: z.string().transform((str) => new Date(str)),
  description: z.string().optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  foodItems: z.array(z.string()).optional(),
  totalCalories: z.number().optional(),
  macros: z.object({
    protein: z.number(),
    carbohydrates: z.number(),
    fat: z.number(),
    fiber: z.number(),
  }).optional(),
  analysis: z.string().optional(),
  confidence: z.number().min(0).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const formData = await request.formData();
    
    const image = formData.get("image") as File;
    const data = JSON.parse(formData.get("data") as string);
    
    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const validated = CreateMealSchema.parse(data);

    // Save image
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads", "meals");
    await mkdir(uploadsDir, { recursive: true });
    
    // Generate unique filename
    const filename = `${Date.now()}-${image.name}`;
    const filepath = path.join(uploadsDir, filename);
    
    await writeFile(filepath, buffer);
    
    const imageUrl = `/uploads/meals/${filename}`;

    const meal = await prisma.meal.create({
      data: {
        ...validated,
        userId: session.user.id,
        imageUrl,
        foodItems: JSON.stringify(validated.foodItems || []),
        macros: validated.macros ? JSON.stringify(validated.macros) : null,
      },
    });

    return NextResponse.json({
      ...meal,
      foodItems: JSON.parse(meal.foodItems),
      macros: meal.macros ? JSON.parse(meal.macros) : null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Error creating meal:", error);
    return NextResponse.json({ error: "Failed to create meal" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const mealType = searchParams.get("mealType");
    const limit = searchParams.get("limit");

    const where: any = {
      userId: session.user.id,
    };

    if (startDate || endDate) {
      where.eatenAt = {};
      if (startDate) {
        where.eatenAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.eatenAt.lte = new Date(endDate);
      }
    }

    if (mealType) {
      where.mealType = mealType;
    }

    const meals = await prisma.meal.findMany({
      where,
      orderBy: { eatenAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(
      meals.map((meal) => ({
        ...meal,
        foodItems: JSON.parse(meal.foodItems),
        macros: meal.macros ? JSON.parse(meal.macros) : null,
      }))
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Error fetching meals:", error);
    return NextResponse.json({ error: "Failed to fetch meals" }, { status: 500 });
  }
}