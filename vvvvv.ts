import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

export async function editImageWithGemini(
  prompt: string,
  base64ImageData: string,
  mimeType: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  // Gemini API expects the base64 string without the data URI prefix
  const pureBase64 = base64ImageData.split(',')[1];
  if (!pureBase64) {
      throw new Error("فۆرماتی داتای وێنەی base64 نادروستە.");
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: pureBase64,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  // Extract the edited image from the response
  const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

  if (imagePart && imagePart.inlineData) {
    const newBase64Data = imagePart.inlineData.data;
    const newMimeType = imagePart.inlineData.mimeType;
    return `data:${newMimeType};base64,${newBase64Data}`;
  } else {
    // Check for safety ratings or other reasons for no image
    const safetyRatings = response.candidates?.[0]?.safetyRatings;
    if (safetyRatings?.some(rating => rating.probability !== 'NEGLIGIBLE')) {
        throw new Error('دروستکردنی وێنە بەهۆی سیاسەتەکانی سەلامەتییەوە ڕاگیرا. تکایە پڕۆمپت یان وێنەیەکی جیاواز تاقی بکەرەوە.');
    }
    throw new Error('هیچ وێنەیەک دروست نەکرا. ڕەنگە مۆدێلەکە نەیتوانیبێت داواکارییەکە جێبەجێ بکات.');
  }
}

export async function generateStyledImageWithPrompt(
  referenceImage: { base64: string; mimeType: string },
  personImage: { base64: string; mimeType: string }
): Promise<{ image: string; prompt: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const pureReferenceBase64 = referenceImage.base64.split(',')[1];
  const purePersonBase64 = personImage.base64.split(',')[1];
  
  if (!pureReferenceBase64 || !purePersonBase64) {
    throw new Error("فۆرماتی داتای وێنەی base64 نادروستە.");
  }
  
  // Step 1: Analyze the style image with a powerful text model for detailed description
  const analysisPrompt = "Analyze this image in extreme detail. Describe its artistic style (e.g., oil painting, photorealistic, anime, watercolor), color palette, lighting (e.g., soft, dramatic, golden hour), composition, subject matter, background, and any notable textures or brushstrokes. Create a detailed, descriptive paragraph that can be used as part of a larger prompt to replicate this style. Be very thorough, specific, and evocative.";
  
  const analysisResponse = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // Use a more powerful model for analysis
    contents: {
        parts: [
            { text: analysisPrompt },
            { inlineData: { data: pureReferenceBase64, mimeType: referenceImage.mimeType } }
        ]
    }
  });
  const styleDescription = analysisResponse.text;

  // Step 2: Construct a new, highly detailed prompt for image generation
  const finalPrompt = `You are an expert digital artist. Your task is to take the person from the provided image and place them in a new scene that perfectly matches the following detailed artistic style description:

**Style Description:**
"${styleDescription}"

**Instructions:**
1.  **Recreate the person** from the image provided.
2.  **Preserve Identity:** It is absolutely critical that you preserve the person's exact facial features, hair, and overall identity. Do not change them. The likeness must be 100% accurate.
3.  **Apply the Style:** Render the person and a new, fitting background using the detailed artistic style described above. The final image should look as if the person was originally photographed or painted in that style.
4.  **Seamless Integration:** The person must be seamlessly and naturally integrated into the new environment. Pay close attention to lighting and shadows to make it look realistic.`;

  // Step 3: Generate the final image using the person image and the detailed prompt
  const generationResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: finalPrompt },
        {
          inlineData: {
            data: purePersonBase64,
            mimeType: personImage.mimeType,
          },
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });


  const imagePart = generationResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

  if (imagePart && imagePart.inlineData) {
    const newBase64Data = imagePart.inlineData.data;
    const newMimeType = imagePart.inlineData.mimeType;
    return {
        image: `data:${newMimeType};base64,${newBase64Data}`,
        prompt: finalPrompt, // Return the detailed, dynamic prompt
    };
  } else {
    const safetyRatings = generationResponse.candidates?.[0]?.safetyRatings;
    if (safetyRatings?.some(rating => rating.probability !== 'NEGLIGIBLE')) {
        throw new Error('دروستکردنی وێنە بەهۆی سیاسەتەکانی سەلامەتییەوە ڕاگیرا. تکایە پڕۆمپت یان وێنەیەکی جیاواز تاقی بکەرەوە.');
    }
    throw new Error('هیچ وێنەیەک دروست نەکرا. ڕەنگە مۆدێلەکە نەیتوانیبێت داواکارییەکە جێبەجێ بکات.');
  }
}