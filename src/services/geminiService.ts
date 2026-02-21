import { GoogleGenAI } from "@google/genai";

export type Gender = "male" | "female" | "unknown";

const BOY_CLOTHING_LINE =
  "CLOTHING (CRITICAL): YOU MUST USE THE REFERENCE CLOTHES (Striped T-shirt, Shorts).";
const GIRL_CLOTHING_LINE =
  "CLOTHING (CRITICAL): YOU MUST USE THE REFERENCE CLOTHES (Sailor-collar gingham dress with bow, pleated skirt, white ankle socks, Mary Jane shoes).";

const BW_SKETCH_PROMPT = `YOU ARE A BOLD, MINIMALIST VECTOR ILLUSTRATOR.
OBJECTIVE: Create a unified flat-vector caricature. You will draw the user's likeness placed onto the provided toddler body. The final image MUST look like a clean, crisp, unified drawing.

OUTPUT STYLE (CRITICAL — STRICT MERCHANDISE VECTOR):
- Aesthetic: Think bold vinyl sticker, Funko Pop, or minimalist retro comic book.
- Line Art: THICK, UNIFORM, BOLD black outlines on every shape. No hairline strokes. No pencil texture.
- Fill Colors: PURE WHITE (#FFFFFF), PURE BLACK (#000000), and MAXIMUM TWO flat solid grey tones.
- ZERO gradients. ZERO shading. ZERO cross-hatching.
- Consistency: The head MUST be drawn in the exact same simplified vector style as the toddler body reference. Do NOT draw a realistic head on a cartoon body.

NEGATIVE PROMPT / STRICT DEFINITELY DO NOTS:
- NO realistic hair. DO NOT draw individual strands of hair. Hair must be a solid graphic-novel style block of black or grey.
- NO realistic stubble or beard hairs. Facial hair must be a solid flat shape.
- NO realistic eyes or teeth. Simplify them into crisp cartoon shapes.
- NO SIGNATURES. NO WATERMARKS. NO TEXT IN THE CORNERS. DO NOT SIGN THE DRAWING.
- NO GLASSES (Unless explicit in input). NO SUNGLASSES. NO HATS. NO JEWELRY. NO PIERCINGS.
- NO BACKGROUND.

INSTRUCTIONS:
1. BODY (STRICT):
   - Pose & Style: You must exactly replicate the raised-hand toddler body and clothing provided in the Reference Image.
   - {{CLOTHING_LINE}}
2. FACE (CARICATURE LIKENESS, BUT AGGRESSIVELY SIMPLIFIED):
   - Goal: Capture the user's likeness (eye shape, nose, distinct traits) but SIMPLIFY it into bold vector graphic shapes.
   - DETECTED USER FEATURES: {{USER_FEATURES}}
   - Rendering: Smooth out wrinkles. Simplify lips into solid flat shapes. Use pure white skin with strict black outlines.
   - Hair & Beard Rule: You MUST group hair and facial hair into large, solid chunky shapes. Absolutely no fine lines or wisps.
   - Proportions: Slightly enlarge the eyes and round the cheeks. It should be a stylized caricature, NOT a photorealistic portrait.
3. INTEGRATION:
   - Connect the head to the body with a visible neck. Keep the neck outline as thick as the body outline.
4. FINISH (FINAL CHECK):
   - Result must be entirely pure white background behind the character.
   - CHECK AGAIN: Are there any signatures or text at the bottom or corners? IF YES, REMOVE THEM BEFORE OUTPUT.`;

// Get API key from environment variable
export function getApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY || "";
}

// ── Body reference loader ─────────────────────────────────────────────────────

async function fetchBodyReference(gender: Gender): Promise<{ base64: string; mimeType: string }> {
  // Pick file based on detected gender; fall back to boy if girl file missing
  const candidates =
    gender === "female"
      ? ["/body-reference-girl.jpg", "/body-reference-girl.jpeg", "/body-reference-girl.png", "/body-reference-boy.jpeg"]
      : ["/body-reference-boy.jpeg", "/body-reference-boy.png"];

  for (const path of candidates) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        console.warn(`Body reference at ${path} returned non-image content-type:`, contentType);
        continue;
      }

      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve((reader.result as string).replace(/^data:image\/\w+;base64,/, ""));
        reader.readAsDataURL(blob);
      });

      // Use the actual mime type from the response (not assumed)
      const mimeType = contentType.split(";")[0].trim();
      console.log(`Body reference loaded: ${path} (gender: ${gender}, type: ${mimeType})`);
      return { base64, mimeType };
    } catch {
      // try next candidate
    }
  }

  console.warn("Could not load any body reference image");
  return { base64: "", mimeType: "image/png" };
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
      parsed.gender === "male" || parsed.gender === "female" ? parsed.gender : "unknown";
    console.log(`Detected gender: ${gender}`);
    return { description: parsed.description || "Generic face", gender };
  } catch {
    console.warn("Could not parse facial analysis JSON, falling back:", raw);
    return { description: raw || "Generic face", gender: "unknown" };
  }
}

// ── Prompt version ────────────────────────────────────────────────────────────

// Update this label whenever the prompt changes significantly
export const PROMPT_VERSION = "v10-aggressive-vector-simplification";
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
  const bodyReference = gender === "female" ? await fetchBodyReference("female") : styleReference;

  // 3. Build the prompt — inject features + gender-appropriate clothing line
  const clothingLine =
    gender === "female" ? GIRL_CLOTHING_LINE : BOY_CLOTHING_LINE;

  const finalPrompt = BW_SKETCH_PROMPT
    .replace("{{USER_FEATURES}}", userFeatures)
    .replace("{{CLOTHING_LINE}}", clothingLine);

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
      contents.push({ text: "MASTER STYLE & BODY TARGET REFERENCE (Replicate this exact flat style, shading, and pose):" });
    } else {
      contents.push({ text: "MASTER STYLE REFERENCE (CRITICAL: You MUST use the exact flat vector style, pure white skin, and clean outlines shown here. Do not add cross-hatching or pencil shading. Match this rendering style perfectly):" });

      // Add the specific female body reference
      if (bodyReference.base64) {
        contents.push({
          inlineData: {
            mimeType: bodyReference.mimeType,
            data: bodyReference.base64,
          },
        });
        contents.push({ text: "BODY & CLOTHING TARGET (Replicate this exact pose and girl clothing, but draw it in the exact flat style of the MASTER STYLE REFERENCE above):" });
      }
    }
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
  return BW_SKETCH_PROMPT;
}

// Legacy alias
export const transformToClownCaricature = transformToToddlerCaricature;
