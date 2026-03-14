import { GoogleGenAI } from "@google/genai";

export type Gender = "male" | "female" | "unknown";

const BOY_CLOTHING_LINE =
  "CLOTHING (CRITICAL): YOU MUST USE THE REFERENCE CLOTHES (Striped T-shirt, Shorts).";
const GIRL_CLOTHING_LINE =
  "CLOTHING (CRITICAL): YOU MUST USE THE REFERENCE CLOTHES (Sailor-collar gingham dress with bow, pleated skirt, white ankle socks, Mary Jane shoes).";

const REALISTIC_PENCIL_PROMPT = `YOU ARE A REALISTIC CARICATURE ARTIST.
OBJECTIVE: Draw a HIGH-FIDELITY caricature of the user on the provided toddler body.
CRITICAL CONSTRAINT: YOU MUST NOT CROP THE HEAD OR FEET. Leave empty white space at the top and bottom of the canvas. Keep the full character completely in frame.

REFERENCE STYLE:
- Style: Smooth Graphite Pencil Drawing (Realistic Shading).
- Technique: Soft blending, detailed hair texture.
- NOT Stippling/Dots. NOT Rough sketch.

NEGATIVE PROMPT / RESTRICTIONS (STRICT):
- NO CROPPING. Do not crop the top of the head/hair or the bottom of the feet. Use a zoomed-out composition.
- NO ZOOMING IN. Keep the full body in frame.
- NO GLASSES (Unless explicit in input).
- NO SUNGLASSES.
- NO HATS.
- NO ADDITIONAL ACCESSORIES.
- DO NOT CHANGE EYE COLOR.

INSTRUCTIONS:
0. COMPOSITION & FRAMING (CRITICAL / OVERRIDE EVERYTHING ELSE):
   - You MUST draw the entire character zoomed out and miniaturized in the center of the canvas.
   - The character (including the oversized head and feet) must occupy ONLY the middle 50% of the canvas.
   - You MUST leave at least 25% of the canvas as pure empty white space ABOVE the character's head.
   - You MUST leave at least 25% of the canvas as pure empty white space BELOW the character's shoes.
   - If you cut off the hair or shoes, the generation is a failure. Draw them smaller!
1. BODY (STRICT): Use the EXACT body from the Reference, but modify the hand action:
   - ACTION: The hand should be open or naturally raised. 
   - STRICTLY NO ROPE: Do not draw any rope, string, or object in the hand. The hand must be empty.
   - PADDING & CROPPING (CRITICAL): Do NOT crop the character. Ensure the ENTIRE body, from the very top of the head/hair to the bottom of the feet/shoes, is fully visible. Leave generous white margins on all sides.
   - {{CLOTHING_LINE}}
   - DO NOT TRANSFER THE USER'S CLOTHES. Ignore the jacket/shirt from the input photo completely.
2. FACE (CRITICAL):
   {{TODDLER_INTENSITY_INSTRUCTIONS}}
3. INTEGRATION: Seamlessly blend the head (user) onto the body (toddler). The neck connection must look natural.
4. FINISH / SILKSCREEN FILTER (CRITICAL):
   Apply the exact serigraphy / silkscreen printing aesthetic shown in the "FINAL SILKSCREEN FILTER REFERENCE" image.
   MANDATORY RULES FOR THE SILKSCREEN FILTER:
   - NO SOFT SHADOWS. No gradients. No smooth shading. No pencil blending.
   - Every area must be either PURE INK or PURE WHITE — nothing in between.
   - Use FLAT, SOLID areas of black ink with HARD EDGES. Think Andy Warhol screen prints.
   - Shadows = DISTINCT FLAT SHAPES of solid ink, NOT gradual darkening or soft gray tones.
   - NO hatching, NO cross-hatching, NO stippling.
   - Background: PURE WHITE, completely clean.
   EXCEPTION FOR THE FACE (CRITICAL):
   - The FACE must retain maximum recognizability even within the flat ink style.
   - Use MORE contour lines on the face than on the body — nose shape, smile lines, jawline, eyebrow arch, eye shape must all be clearly defined with distinct ink lines.
   - Facial likeness is EQUALLY important as the silkscreen aesthetic. Do NOT sacrifice recognizable features for the sake of simplification.
   - The face should have the MOST detail in the entire drawing — it is the focal point.`;

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

async function fetchSingleReference(
  path: string,
): Promise<{ base64: string; mimeType: string }> {
  try {
    const response = await fetch(path);
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
    console.log(`Reference loaded: ${path} (type: ${mimeType})`);
    return { base64, mimeType };
  } catch {
    console.warn(`Could not load reference: ${path}`);
    return { base64: "", mimeType: "image/png" };
  }
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
export const PROMPT_VERSION = "v3-dynamic-intensity";
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
  toddlerIntensity: number = 50,
  applySilkscreenFilter: boolean = true,
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

  // 2. Fetch references
  // When silkscreen filter is OFF, use the pencil-style body reference instead
  const styleReference = applySilkscreenFilter
    ? await fetchBodyReference("male")
    : await fetchSingleReference("/body-reference-pencil.png");
  const bodyReference =
    gender === "female" ? await fetchBodyReference("female") : styleReference;
  const finalFilterReference = applySilkscreenFilter
    ? await fetchFinalStyleReference()
    : { base64: "", mimeType: "image/png" };

  // 3. Prepare dynamic intensity instructions
  // The 100% level matches the ORIGINAL prompt from commit 4e36b5b that
  // the user loved — subtle toddler-fication, NOT extreme baby eyes.
  let dynamicFaceInstruction = "";
  if (toddlerIntensity >= 87.5) {
    // 100% — ORIGINAL PROMPT (commit 4e36b5b). This is the gold standard.
    dynamicFaceInstruction = `- COMPOSITION RULE: The image must contain ONLY ONE PERSON (The Toddler Body + The User's Head).
   - ACTION: REPLACE the toddler's original head with a "TODDLER-FIED" version of the User.
   - CONCEPT: Apply a "Baby Filter" to the user's face.
   - DETECTED USER FEATURES: {{USER_FEATURES}}
   - CHANGES: Make the cheeks rounder, the jawline softer/smaller, and the eyes slightly larger/cuter.
   - PRESERVE: You MUST keep the beard/mustache (if present), the smile lines, and the specific nose shape.
   - GOAL: "Cute Toddler with a Beard" (Funny but adorable). Not a grumpy old man, not a generic baby.
   - TEXTURE: keep it pencil sketch, but slightly smoother skin than a harsh adult portrait.`;
  } else if (toddlerIntensity >= 62.5) {
    // 75% — Slightly less toddler, more adult proportions bleeding through
    dynamicFaceInstruction = `- COMPOSITION RULE: The image must contain ONLY ONE PERSON (The Toddler Body + The User's Head).
   - ACTION: REPLACE the toddler's original head with a slightly "TODDLER-FIED" version of the User.
   - CONCEPT: Gentle baby filter — lean more toward the real person's likeness than toward a baby.
   - DETECTED USER FEATURES: {{USER_FEATURES}}
   - CHANGES: Only slightly round the cheeks and soften the jawline. Keep the eyes close to their natural size. The face should read as the person first, baby second.
   - PRESERVE: You MUST keep the beard/mustache (if present), wrinkles, smile lines, the specific nose shape, and all defining character.
   - GOAL: The person is clearly recognizable. A subtle youthful softness, not a baby transformation.
   - TEXTURE: keep it pencil sketch, showing realistic skin texture and character.`;
  } else if (toddlerIntensity >= 37.5) {
    // 50% — Caricature with exaggerated features, minimal baby filter
    dynamicFaceInstruction = `- COMPOSITION RULE: The image must contain ONLY ONE PERSON (The Toddler Body + The User's Head).
   - ACTION: REPLACE the toddler's original head with a CARICATURE of the User's face.
   - CONCEPT: Expressive caricature — exaggerate the user's defining features without infantilizing.
   - DETECTED USER FEATURES: {{USER_FEATURES}}
   - CHANGES: Exaggerate the user's most defining facial features (big nose stays big, strong chin stays strong). Do NOT round cheeks or enlarge eyes. Keep adult proportions.
   - PRESERVE: Keep ALL mature features: wrinkles, beard/mustache, natural jawline, natural eye size. Strongly pronounce and emphasize them.
   - PROPORTIONS: The head should be oversized compared to the small toddler body (bobblehead effect). **CRITICAL:** Scale down the entire character so the large head does not get cropped out of the frame.
   - TEXTURE: Keep it pencil sketch, showing realistic skin texture, strong contours, and character lines.`;
  } else if (toddlerIntensity >= 12.5) {
    // 25% — Strong adult likeness, just placed on the toddler body
    dynamicFaceInstruction = `- COMPOSITION RULE: The image must contain ONLY ONE PERSON (The Toddler Body + The User's Head).
   - ACTION: REPLACE the toddler's original head with a highly faithful portrait of the User's face.
   - CONCEPT: Hyper-realistic adult face transfer — zero baby filter. Pure likeness.
   - DETECTED USER FEATURES: {{USER_FEATURES}}
   - CHANGES: DO NOT soften, round, or enlarge anything. Reproduce the face as-is with maximum fidelity to the source photo.
   - PRESERVE: Preserve 100% of adult likeness, age markers, facial hair, jawline shape, eye size, and every characteristic.
   - PROPORTIONS: The head should be oversized compared to the small toddler body.
   - TEXTURE: Keep it pencil sketch, showing realistic skin texture, strong contours, and character lines.`;
  } else {
    // 0% — Direct transfer, proportional head
    dynamicFaceInstruction = `- COMPOSITION RULE: The image must contain ONLY ONE PERSON (The Toddler Body + The User's Head).
   - ACTION: Direct 1:1 face transfer onto the toddler body.
   - CONCEPT: Exact adult likeness transfer with zero stylization.
   - DETECTED USER FEATURES: {{USER_FEATURES}}
   - CHANGES: ZERO styling on the face structure. Exact 1:1 adult likeness. Match the pencil sketch texture of the body. DO NOT round cheeks or enlarge eyes.
   - PRESERVE: Preserve 100% of adult likeness, age markers, facial hair, jawline, and proportions.
   - PROPORTIONS: Scale the head to fit the neck naturally. Do not make it a massive bobblehead. Keep it proportional or only slightly larger.
   - TEXTURE: Match the pencil sketch texture.`;
  }

  // 4. Build the prompt — strip silkscreen step if filter is off
  const clothingLine =
    gender === "female" ? GIRL_CLOTHING_LINE : BOY_CLOTHING_LINE;

  let prompt = REALISTIC_PENCIL_PROMPT;
  if (!applySilkscreenFilter) {
    // Remove everything from step 4 onward
    prompt = prompt.replace(/\n4\. FINISH \/ SILKSCREEN FILTER[\s\S]*$/, "");
    // Add a new step 4 for pencil realism that prioritizes face likeness 100%
    prompt += `\n4. FINISH / PENCIL REALISM (CRITICAL):
   - FACIAL LIKENESS IS THE #1 PRIORITY. The person MUST be 100% instantly recognizable.
   - Study the source photo carefully: reproduce the EXACT nose shape, eye spacing, eyebrow arch, lip shape, jawline, and hairline.
   - Maintain the "Smooth Graphite Pencil Drawing" style from the body reference, full shading and blending allowed.
   - The face should have the HIGHEST level of detail in the entire drawing.
   - Background: completely clean white paper. Ensure a thick white border around the character so NO PART of the drawing touches the edge of the screen.`;
  }

  // Forcefully append global framing rule again to the end of every prompt to make sure it's the last thing the model reads.
  prompt += `\n\nFINAL CRITICAL CHECK: Look at the edges of the canvas. You must leave a huge amount of empty white paper above the head and below the shoes. Shrink the character drastically so they look tiny on the page. NO CROPPING ALLOWED!`;

  const finalPrompt = prompt
    .replace("{{TODDLER_INTENSITY_INSTRUCTIONS}}", dynamicFaceInstruction)
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
      text: "FINAL SILKSCREEN FILTER REFERENCE (CRITICAL: The final output MUST match this exact printing style — flat solid ink, hard edges, NO soft shadows or gradients. Only pure black ink on pure white paper. Copy this aesthetic exactly.):",
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
      imageConfig: {
        aspectRatio: "9:16",
      },
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
