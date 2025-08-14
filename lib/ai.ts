import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const ExtractedReadingSchema = z.object({
  heightCm: z.number().nullable(),
  weightKg: z.number().nullable(),
  bmi: z.number().nullable(),
  standardWeightKg: z.number().nullable(),
  systolic: z.number().nullable(),
  diastolic: z.number().nullable(),
  pulse: z.number().nullable(),
  machineNotes: z.array(z.string()),
});

export type ExtractedReading = z.infer<typeof ExtractedReadingSchema>;

export const ValidatedReadingSchema = z.object({
  heightCm: z.number().min(120).max(210).nullable(),
  weightKg: z.number().min(30).max(200).nullable(),
  bmi: z.number().min(12).max(45).nullable(),
  standardWeightKg: z.number().min(30).max(150).nullable(),
  systolic: z.number().min(80).max(200).nullable(),
  diastolic: z.number().min(40).max(130).nullable(),
  pulse: z.number().min(30).max(200).nullable(),
});

export type ValidatedReading = z.infer<typeof ValidatedReadingSchema>;

const EXTRACTION_PROMPT = `You will see 2 photos from health kiosks. Extract all numeric vitals.
Rules:
- Return ONLY JSON matching the schema.
- If a field is absent, set it to null (not 0).
- Read red LED 7-seg displays accurately. Ignore background posters.
- Numbers may contain decimals.
- If both height & weight are present but BMI is missing, leave bmi null (the app will compute).
- Prefer the largest, centered instrument readings; ignore reflections.
- Machines commonly present:
  (A) Height/Weight/BMI scale with fields: HEIGHT (cm), WEIGHT (kg), BMI, STANDARD WEIGHT (kg).
  (B) Omron HBP-9020 blood pressure monitor with: systolic (upper, mmHg), diastolic (lower, mmHg), pulse (bpm).
- Accept minor OCR quirks (e.g., 164.6 vs 164.8); do your best to disambiguate.

Return JSON:
{
  "heightCm": number|null,
  "weightKg": number|null,
  "bmi": number|null,
  "standardWeightKg": number|null,
  "systolic": number|null,
  "diastolic": number|null,
  "pulse": number|null,
  "machineNotes": string[]
}`;

export async function extractReadingsFromImage(
  imageBuffers: (Buffer | string)[],
  mimeType: string = "image/jpeg"
): Promise<ExtractedReading> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.95,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    const imageParts = imageBuffers.map(imageBuffer => ({
      inlineData: {
        data: typeof imageBuffer === "string" ? imageBuffer : imageBuffer.toString("base64"),
        mimeType,
      },
    }));

    const result = await model.generateContent([EXTRACTION_PROMPT, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Parse and validate the JSON response
    const parsed = JSON.parse(text);
    console.log("Extracted readings:", parsed);
    const validated = ExtractedReadingSchema.parse(parsed);

    return validated;
  } catch (error) {
    console.error("Error extracting readings:", error);
    throw new Error("Failed to extract readings from image");
  }
}

export function validateAndComputeReading(reading: ExtractedReading): ValidatedReading {
  let processed = { ...reading };

  // Compute BMI if we have height and weight but no BMI
  if (processed.heightCm && processed.weightKg && !processed.bmi) {
    const heightM = processed.heightCm / 100;
    processed.bmi = Math.round((processed.weightKg / (heightM * heightM)) * 100) / 100;
  }

  // Round floats
  if (processed.heightCm) processed.heightCm = Math.round(processed.heightCm * 10) / 10;
  if (processed.weightKg) processed.weightKg = Math.round(processed.weightKg * 10) / 10;
  if (processed.bmi) processed.bmi = Math.round(processed.bmi * 100) / 100;
  if (processed.standardWeightKg)
    processed.standardWeightKg = Math.round(processed.standardWeightKg * 10) / 10;

  // Validate with strict schema
  const validated = ValidatedReadingSchema.parse(processed);
  return validated;
}
