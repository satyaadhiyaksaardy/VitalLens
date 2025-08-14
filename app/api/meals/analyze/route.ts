import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/auth-api";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const description = formData.get("description") as string;
    
    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Create the prompt for Gemini
    const prompt = `
Analyze this food image and provide a detailed nutritional breakdown. 

User's description: "${description || 'No description provided'}"

Please provide:
1. List of identified food items with estimated portions
2. Total estimated calories
3. Macronutrient breakdown (protein, carbohydrates, fat, fiber in grams)
4. Nutritional assessment and suggestions for fitness goals
5. Confidence level of your analysis (0-100%)

Format your response as JSON with this structure:
{
  "foodItems": ["item1", "item2"],
  "totalCalories": number,
  "macros": {
    "protein": number,
    "carbohydrates": number,
    "fat": number,
    "fiber": number
  },
  "analysis": "detailed feedback text",
  "confidence": number (0-100),
  "suggestions": "suggestions for fitness goals"
}`;

    // Analyze image with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    let analysis;
    try {
      // Extract JSON from response (sometimes Gemini adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        analysis = {
          foodItems: ["Unknown food items"],
          totalCalories: 0,
          macros: { protein: 0, carbohydrates: 0, fat: 0, fiber: 0 },
          analysis: text,
          confidence: 50,
          suggestions: "Please provide a clearer image for better analysis."
        };
      }
    } catch (parseError) {
      // Fallback for parsing errors
      analysis = {
        foodItems: ["Could not identify food items"],
        totalCalories: 0,
        macros: { protein: 0, carbohydrates: 0, fat: 0, fiber: 0 },
        analysis: text,
        confidence: 30,
        suggestions: "Analysis completed but formatting may be limited."
      };
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Error analyzing meal:", error);
    return NextResponse.json({ error: "Failed to analyze meal" }, { status: 500 });
  }
}