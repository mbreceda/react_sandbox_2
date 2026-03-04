import { GoogleGenAI } from "@google/genai";

export type Gender = "male" | "female" | "unknown";

const BOY_CLOTHING_LINE =
  "CLOTHING (CRITICAL): YOU MUST USE THE REFERENCE CLOTHES (Striped T-shirt, Shorts).";
const GIRL_CLOTHING_LINE =
  "CLOTHING (CRITICAL): YOU MUST USE THE REFERENCE CLOTHES (Sailor-collar gingham dress with bow, pleated skirt, white ankle socks, Mary Jane shoes).";

const REALISTIC_PENCIL_PROMPT = `YOU ARE A REALISTIC CARICATURE ARTIST.
OBJECTIVE: Draw a HIGH-FIDELITY caricature of the user on the provided toddler body.

REFERENCE STYLE:
- Style: Smooth Graphite Pencil Drawing (Realistic Shading).
- Technique: Soft blending, detailed hair texture.
- NOT Stippling/Dots. NOT Rough sketch.

NEGATIVE PROMPT / RESTRICTIONS (STRICT):
- NO GLASSES (Unless explicit in input).
- NO SUNGLASSES.
- NO HATS.
- NO ADDITIONAL ACCESSORIES.
- DO NOT CHANGE EYE COLOR.

INSTRUCTIONS:
1. BODY (STRICT): Use the EXACT body from the Reference, but modify the hand action:
   - ACTION: The hand should be open or naturally raised. 
   - STRICTLY NO ROPE: Do not draw any rope, string, or object in the hand. The hand must be empty.
   - {{CLOTHING_LINE}}
   - DO NOT TRANSFER THE USER'S CLOTHES. Ignore the jacket/shirt from the input photo completely.
2. FACE (CRITICAL - TODDLER VERSION):
   - COMPOSITION RULE: The image must contain ONLY ONE PERSON (The Toddler Body + The User's Head).
   - ACTION: REPLACE the toddler's original head with a "TODDLER-FIED" version of the User.
   - CONCEPT: Apply a "Baby Filter" to the user's face.
   - DETECTED USER FEATURES: {{USER_FEATURES}}
   - CHANGES: Make the cheeks rounder, the jawline softer/smaller, and the eyes slightly larger/cuter.
   - PRESERVE: You MUST keep the beard/mustache (if present), the smile lines, and the specific nose shape.
   - GOAL: "Cute Toddler with a Beard" (Funny but adorable). Not a grumpy old man, not a generic baby.
   - TEXTURE: keep it pencil sketch, but slightly smoother skin than a harsh adult portrait.
3. INTEGRATION: Seamlessly blend the head (user) onto the body (toddler). The neck connection must look natural.
4. FINISH / SILKSCREEN FILTER (CRITICAL): Apply the exact serigraphy / silkscreen printing aesthetic shown in the "FINAL SILKSCREEN FILTER REFERENCE" image to the ENTIRE final drawing. Clean white background.`;

// Get API key from environment variable
export function getApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY || "";
}

// ── Body reference loader ─────────────────────────────────────────────────────

async function fetchBodyReference(
  gender: Gender,
): Promise<{ base64: string; mimeType: string }> {
  // Pick file based on detected gender; fall back to boy if girl file missing
  const candidates =
    gender === "female"
      ? [
          "/body-reference-girl.jpg",
          "/body-reference-girl.jpeg",
          "/body-reference-girl.png",
          "/body-reference-boy.jpeg",
        ]
      : ["/body-reference-boy.jpeg", "/body-reference-boy.png"];

  for (const path of candidates) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        console.warn(
          `Body reference at ${path} returned non-image content-type:`,
          contentType,
        );
        continue;
      }

      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve(
            (reader.result as string).replace(/^data:image\/\w+;base64,/, ""),
          );
        reader.readAsDataURL(blob);
      });

      // Use the actual mime type from the response (not assumed)
      const mimeType = contentType.split(";")[0].trim();
      console.log(
        `Body reference loaded: ${path} (gender: ${gender}, type: ${mimeType})`,
      );
      return { base64, mimeType };
    } catch {
      // try next candidate
    }
  }

  console.warn("Could not load any body reference image");
  return { base64: "", mimeType: "image/png" };
}

async function fetchFinalStyleReference(): Promise<{
  base64: string;
  mimeType: string;
}> {
  try {
    const response = await fetch("/body-reference-final.png");
    if (!response.ok) return { base64: "", mimeType: "image/png" };

    const contentType = response.headers.get("content-type") || "";
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve(
          (reader.result as string).replace(/^data:image\/\w+;base64,/, ""),
        );
      reader.readAsDataURL(blob);
    });

    const mimeType = contentType.split(";")[0].trim() || "image/png";
    console.log(`Final style filter loaded (type: ${mimeType})`);
    return { base64, mimeType };
  } catch {
    console.warn("Could not load final style reference image");
    return { base64: "", mimeType: "image/png" };
  }
}

// ── Facial analysis (features + gender in one call) ───────────────────────────

interface FacialAnalysis {
  description: string;
  gender: Gender;
}

async function analyzeFacialFeatures(
  imageBase64: string,
  apiKey: string,
): Promise<FacialAnalysis> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        text: `Analyze this face and return a JSON object with two fields:
1. "description": A DETAILED physical description for a caricature artist. Focus on: face shape, nose structure, eye shape/spacing, eyelash prominence or eyeliner, eyebrow arch/thickness, lip fullness/shape, hair styling/silhouette, and distinct features (beard, moles). Be precise to ensure strong recognizability, especially capturing feminine features if present.
2. "gender": The apparent gender of the person in the photo. Return exactly one of: "male", "female", or "unknown". Base this on visible physical characteristics only.

Return ONLY valid JSON, no markdown, no explanation. Example format:
{"description": "...", "gender": "male"}`,
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBase64,
        },
      },
    ],
  });

  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const gender: Gender =
      parsed.gender === "male" || parsed.gender === "female"
        ? parsed.gender
        : "unknown";
    console.log(`Detected gender: ${gender}`);
    return { description: parsed.description || "Generic face", gender };
  } catch {
    console.warn("Could not parse facial analysis JSON, falling back:", raw);
    return { description: raw || "Generic face", gender: "unknown" };
  }
}

// ── Prompt version ────────────────────────────────────────────────────────────

// Update this label whenever the prompt changes significantly
export const PROMPT_VERSION = "v1";
const MODEL_USED = "gemini-2.5-flash-image";

export interface GenerationResult {
  imageDataUrl: string;
  detectedFeatures: string;
  detectedGender: Gender;
  promptVersion: string;
  modelUsed: string;
}

// Helper to prevent rate limiting
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main generation function ──────────────────────────────────────────────────

export async function transformToToddlerCaricature(
  imageBase64: string,
  apiKey?: string,
): Promise<GenerationResult> {
  const keyToUse = apiKey || getApiKey();

  if (!keyToUse) {
    throw new Error(
      "API Key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY al archivo .env",
    );
  }

  const ai = new GoogleGenAI({ apiKey: keyToUse });

  // Clean user image base64
  const cleanUserImage = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  // 1. Analyze facial features + detect gender (single API call)
  const { description: userFeatures, gender } = await analyzeFacialFeatures(
    cleanUserImage,
    keyToUse,
  );
  console.log("Detected Features:", userFeatures);
  console.log("Detected Gender:", gender);

  // Wait to avoid hitting rate limits (429)
  await delay(1500);

  // 2. Fetch references — always fetch the boy to use as the master style standard
  const styleReference = await fetchBodyReference("male");
  const bodyReference =
    gender === "female" ? await fetchBodyReference("female") : styleReference;
  const finalFilterReference = await fetchFinalStyleReference();

  // 3. Build the prompt — inject features + gender-appropriate clothing line
  const clothingLine =
    gender === "female" ? GIRL_CLOTHING_LINE : BOY_CLOTHING_LINE;

  const finalPrompt = REALISTIC_PENCIL_PROMPT.replace(
    "{{USER_FEATURES}}",
    userFeatures,
  ).replace("{{CLOTHING_LINE}}", clothingLine);

  const contents: Array<{
    text?: string;
    inlineData?: { mimeType: string; data: string };
  }> = [{ text: finalPrompt }];

  // Add master style reference first
  if (styleReference.base64) {
    contents.push({
      inlineData: {
        mimeType: styleReference.mimeType,
        data: styleReference.base64,
      },
    });

    // If it's a boy, the body and style are the same image
    if (gender === "male" || styleReference.base64 === bodyReference.base64) {
      contents.push({
        text: "MASTER STYLE & BODY TARGET REFERENCE (Replicate this exact flat style, shading, and pose):",
      });
    } else {
      contents.push({
        text: "MASTER STYLE REFERENCE (CRITICAL: You MUST use the exact flat vector style, pure white skin, and clean outlines shown here. Do not add cross-hatching or pencil shading. Match this rendering style perfectly):",
      });

      // Add the specific female body reference
      if (bodyReference.base64) {
        contents.push({
          inlineData: {
            mimeType: bodyReference.mimeType,
            data: bodyReference.base64,
          },
        });
        contents.push({
          text: "BODY & CLOTHING TARGET (Replicate this exact pose and girl clothing, but draw it in the exact flat style of the MASTER STYLE REFERENCE above):",
        });
      }
    }
  }

  // Add final filter reference
  if (finalFilterReference.base64) {
    contents.push({
      inlineData: {
        mimeType: finalFilterReference.mimeType,
        data: finalFilterReference.base64,
      },
    });
    contents.push({
      text: "FINAL SILKSCREEN FILTER REFERENCE (CRITICAL: You MUST apply this serigraphy/silkscreen graphic effect to the ENTIRE final generated drawing. Mimic the bold ink textures and contrast.):",
    });
  }

  // Add user photo last (face to transform)
  contents.push({
    inlineData: {
      mimeType: "image/png",
      data: cleanUserImage,
    },
  });
  contents.push({ text: "User Face (SOURCE - Use for likeness):" });

  const response = await ai.models.generateContent({
    model: MODEL_USED,
    contents,
    config: {
      responseModalities: ["Text", "Image"],
    },
  });

  // Extract generated image from response
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          imageDataUrl: `data:image/png;base64,${part.inlineData.data}`,
          detectedFeatures: userFeatures,
          detectedGender: gender,
          promptVersion: PROMPT_VERSION,
          modelUsed: MODEL_USED,
        };
      }
    }
  }

  throw new Error("No image was generated. Please try again.");
}

export function getPromptForTransformation(): string {
  return REALISTIC_PENCIL_PROMPT;
}

// Legacy alias
export const transformToClownCaricature = transformToToddlerCaricature;
