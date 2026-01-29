import { GoogleGenAI } from "@google/genai";
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

console.log("--- GEMINI SDK DIAGNOSTIC (V1.0.3) ---");
console.log("GoogleGenAI prototype methods:", Object.keys(GoogleGenAI.prototype));

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

export function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
  if (!key) {
    console.warn("WARNING: EXPO_PUBLIC_GEMINI_API_KEY NO ENCONTRADA.");
  }
  return key;
}

async function fetchBodyReference(): Promise<string> {
  try {
    const asset = Asset.fromModule(require('../assets/body-reference.png'));
    await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.warn("Could not load body reference image", error);
    return "";
  }
}

async function ensureBase64(input: string): Promise<string> {
  console.log("[GeminiService] Checking if input is URI or Base64...");

  if (input.includes(';base64,')) {
    console.log("[GeminiService] Found data-uri prefix, stripping...");
    return input.split(';base64,')[1];
  }

  if (input.startsWith('file://') || input.startsWith('/')) {
    console.log("[GeminiService] Detected local file path, reading starts...");
    try {
      const base64 = await FileSystem.readAsStringAsync(input, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("[GeminiService] Successfully read file into base64. Length:", base64.length);
      return base64;
    } catch (e: any) {
      console.error("[GeminiService] CRITICAL ERROR reading local file:", e);
      throw new Error("Error al leer la imagen: " + (e.message || "Error desconocido"));
    }
  }

  // If it's something else, assume it's already base64 but return it with length log
  console.log("[GeminiService] Assuming input is raw base64. Length:", input.length);
  return input;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
        parts: [
          { text: "Analyze this face and provide a DETAILED physical description for a caricature artist. Focus on specific facial landmarks: face shape (round, oval, square), nose structure (button, hooked, wide), eye shape/spacing, eyebrow thickness/shape, mouth size/shape, and any distinctive features (beard style, glasses, moles, hairline). Be precise to ensure recognizability." },
          {
            inlineData: {
              mimeType: "image/png",
              data: imageBase64,
            },
          },
        ]
      },
    ],
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.text || "Generic face";
}

export async function transformToToddlerCaricature(
  inputImage: string,
  apiKey?: string,
): Promise<string> {
  const keyToUse = apiKey || getApiKey();

  if (!keyToUse) {
    throw new Error(
      "API Key de Gemini no configurada. Agrega EXPO_PUBLIC_GEMINI_API_KEY al archivo .env",
    );
  }

  const ai = new GoogleGenAI({ apiKey: keyToUse });

  // 0. Ensure we have raw base64 (Fix for URI error)
  const cleanUserImage = await ensureBase64(inputImage);

  // 1. Analyze facial features first
  console.log("[GeminiService] Analyzing facial features...");
  const userFeatures = await analyzeFacialFeatures(cleanUserImage, keyToUse);
  console.log("[GeminiService] Detected Features:", userFeatures);

  await delay(1500);

  // 2. Get body reference
  const referenceBase64 = await fetchBodyReference();

  // 3. Construct prompt with features
  const finalPrompt = BW_SKETCH_PROMPT.replace(
    "{{USER_FEATURES}}",
    userFeatures,
  );

  const contentsParts: any[] = [{ text: finalPrompt }];

  if (referenceBase64) {
    contentsParts.push({
      inlineData: {
        mimeType: "image/png",
        data: referenceBase64,
      },
    });
    contentsParts.push({ text: "Reference Image (STYLE & BODY TARGET):" });
  }

  contentsParts.push({
    inlineData: {
      mimeType: "image/png",
      data: cleanUserImage,
    },
  });
  contentsParts.push({ text: "User Face (SOURCE - Use for likeness):" });

  console.log("[GeminiService] Sending transformation request to Gemini...");
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        parts: contentsParts
      }
    ],
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
