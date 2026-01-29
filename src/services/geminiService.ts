import { GoogleGenAI } from "@google/genai";

const BW_SKETCH_PROMPT = `YOU ARE A REALISTIC CARICATURE ARTIST.
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
1. BODY (STRICT): Use the EXACT body from the Reference, but change the hand action:
   - ACTION: The hand is firmly GRIPPING A ROPE (pulling/tugging it).
   - CLOTHING (CRITICAL): YOU MUST USE THE REFERENCE CLOTHES (Striped T-shirt, Shorts).
   - DO NOT TRANSFER THE USER'S CLOTHES. Ignore the jacket/shirt from the input photo completely.
2. FACE (CRITICAL - TODDLER VERSION):
   - COMPOSITION RULE: The image must contain ONLY ONE PERSON (The Toddler Body + The User's Head).
   - ACTION: REPLACE the toddler's original head with a "TODDLER-FIED" version of the User.
   - CONCEPT: Apply a "Baby Filter" to the user's face.
   - CHANGES: Make the cheeks rounder, the jawline softer/smaller, and the eyes slightly larger/cuter.
   - PRESERVE: You MUST keep the beard/mustache (if present), the smile lines, and the specific nose shape.
   - GOAL: "Cute Toddler with a Beard" (Funny but adorable). Not a grumpy old man, not a generic baby.
   - TEXTURE: keep it pencil sketch, but slightly smoother skin than a harsh adult portrait.
3. INTEGRATION: Seamlessly blend the head (user) onto the body (toddler). The neck connection must look natural.
4. FINISH: Clean white background, soft drop shadow.`;

// Get API key from environment variable
export function getApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY || "";
}

async function fetchBodyReference(): Promise<string> {
  try {
    const response = await fetch("/body-reference.png");
    if (!response.ok) return "";
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.replace(/^data:image\/\w+;base64,/, ""));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Could not load body reference image", error);
    return "";
  }
}

async function analyzeFacialFeatures(
  imageBase64: string,
  apiKey: string,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        text: "Analyze this face and provide a DETAILED physical description for a caricature artist. Focus on specific facial landmarks: face shape (round, oval, square), nose structure (button, hooked, wide), eye shape/spacing, eyebrow thickness/shape, mouth size/shape, and any distinctive features (beard style, glasses, moles, hairline). Be precise to ensure recognizability.",
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBase64,
        },
      },
    ],
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.text || "Generic face";
}

// Helper to prevent rate limiting
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function transformToToddlerCaricature(
  imageBase64: string,
  apiKey?: string,
): Promise<string> {
  const keyToUse = apiKey || getApiKey();

  if (!keyToUse) {
    throw new Error(
      "API Key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY al archivo .env",
    );
  }

  const ai = new GoogleGenAI({ apiKey: keyToUse });

  // Clean user image base64
  const cleanUserImage = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  // 1. Analyze facial features first
  const userFeatures = await analyzeFacialFeatures(cleanUserImage, keyToUse);
  console.log("Detected Features:", userFeatures);

  // Wait 1 second to breathe and avoid hitting rate limits (429)
  await delay(1500);

  // 2. Get body reference
  const referenceBase64 = await fetchBodyReference();

  // 3. Construct prompt with features
  const finalPrompt = BW_SKETCH_PROMPT.replace(
    "{{USER_FEATURES}}",
    userFeatures,
  );

  const contents: Array<{
    text?: string;
    inlineData?: { mimeType: string; data: string };
  }> = [{ text: finalPrompt }];

  // Add Reference Image first (context)
  if (referenceBase64) {
    contents.push({
      inlineData: {
        mimeType: "image/png",
        data: referenceBase64,
      },
    });
    contents.push({ text: "Reference Image (STYLE & BODY TARGET):" });
  }

  // Add User Image (content to transform)
  contents.push({
    inlineData: {
      mimeType: "image/png",
      data: cleanUserImage,
    },
  });
  contents.push({ text: "User Face (SOURCE - Use for likeness):" });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image", // Nano Banana
    contents: contents,
    config: {
      responseModalities: ["Text", "Image"],
    },
  });

  // Extract generated image from response
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image was generated. Please try again.");
}

export function getPromptForTransformation(): string {
  return BW_SKETCH_PROMPT;
}

// Legacy alias to keep compatibility if needed, though we updated the component to use transformToToddlerCaricature again
export const transformToClownCaricature = transformToToddlerCaricature;
