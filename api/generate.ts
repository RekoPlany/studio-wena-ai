// api/generate.ts

// This is a Vercel Serverless Function, not client-side code.
// It can safely use environment variables.
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Vercel auto-imports this type, but we can define it for clarity
interface VercelRequest {
  body: any;
}

interface VercelResponse {
  status: (code: number) => {
    json: (data: any) => void;
  };
}

// Main handler for the serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (process.env.NODE_ENV !== 'development' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    if (action === 'edit') {
      const { prompt, image } = req.body;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: image.base64, mimeType: image.mimeType } },
            { text: prompt },
          ],
        },
        config: { responseModalities: [Modality.IMAGE] },
      });
      
      const resultImage = extractImage(response);
      return res.status(200).json({ image: resultImage });

    } else if (action === 'style') {
      const { styleImage, personImage } = req.body;

      // Step 1: Analyze the style image
      const analysisPrompt = "Analyze this image in extreme detail. Describe its artistic style (e.g., oil painting, photorealistic, anime, watercolor), color palette, lighting (e.g., soft, dramatic, golden hour), composition, subject matter, background, and any notable textures or brushstrokes. Create a detailed, descriptive paragraph that can be used as part of a larger prompt to replicate this style. Be very thorough, specific, and evocative.";
      const analysisResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
            parts: [
                { text: analysisPrompt },
                { inlineData: { data: styleImage.base64, mimeType: styleImage.mimeType } }
            ]
        }
      });
      const styleDescription = analysisResponse.text;

      // Step 2: Construct the final prompt
      const finalPrompt = `You are an expert digital artist. Your task is to take the person from the provided image and place them in a new scene that perfectly matches the following detailed artistic style description:\n\n**Style Description:**\n"${styleDescription}"\n\n**Instructions:**\n1. **Recreate the person** from the image provided.\n2. **Preserve Identity:** It is absolutely critical that you preserve the person's exact facial features, hair, and overall identity. Do not change them. The likeness must be 100% accurate.\n3. **Apply the Style:** Render the person and a new, fitting background using the detailed artistic style described above.\n4. **Seamless Integration:** The person must be seamlessly and naturally integrated into the new environment. Pay close attention to lighting and shadows.`;

      // Step 3: Generate the final image
      const generationResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: finalPrompt },
            { inlineData: { data: personImage.base64, mimeType: personImage.mimeType } },
          ],
        },
        config: { responseModalities: [Modality.IMAGE] },
      });

      const resultImage = extractImage(generationResponse);
      return res.status(200).json({ image: resultImage, prompt: finalPrompt });

    } else {
      return res.status(400).json({ error: 'Action not specified or invalid' });
    }
  } catch (error: any) {
    console.error('Error in serverless function:', error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred' });
  }
}

function extractImage(response: GenerateContentResponse): string {
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
        const newBase64Data = imagePart.inlineData.data;
        const newMimeType = imagePart.inlineData.mimeType;
        return `data:${newMimeType};base64,${newBase64Data}`;
    } else {
        const safetyRatings = response.candidates?.[0]?.safetyRatings;
        if (safetyRatings?.some(rating => rating.probability !== 'NEGLIGIBLE')) {
            throw new Error('دروستکردنی وێنە بەهۆی سیاسەتەکانی سەلامەتییەوە ڕاگیرا.');
        }
        throw new Error('هیچ وێنەیەک لەلایەن AIـیەوە دروست نەکرا.');
    }
}
