// This file contains the exact prompt used for AI extraction
// It's kept here for reference and easy modification

export const SYSTEM_PROMPT = "You convert kiosk photos into clean, verified numbers.";

export const USER_PROMPT = `You will see 2 photos from health kiosks. Extract all numeric vitals.
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
  "machineNotes": string[]  // e.g., ["height/weight machine present", "omron hbp-9020 present"]
}

Images:
<attach uploaded image(s) here>`;
