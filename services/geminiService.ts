// services/geminiService.ts

async function callGenerateApi(body: object) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'هەڵەیەک لە سێرڤەر ڕوویدا');
  }

  return response.json();
}

export async function editImageWithGemini(
  prompt: string,
  base64ImageData: string,
  mimeType: string
): Promise<string> {
  const pureBase64 = base64ImageData.split(',')[1];
  const result = await callGenerateApi({
    action: 'edit',
    prompt,
    image: {
      base64: pureBase64,
      mimeType,
    },
  });
  return result.image;
}

export async function generateStyledImageWithPrompt(
  referenceImage: { base64: string; mimeType: string },
  personImage: { base64: string; mimeType: string }
): Promise<{ image: string; prompt: string }> {
  const pureReferenceBase64 = referenceImage.base64.split(',')[1];
  const purePersonBase64 = personImage.base64.split(',')[1];

  return callGenerateApi({
    action: 'style',
    styleImage: {
      base64: pureReferenceBase64,
      mimeType: referenceImage.mimeType,
    },
    personImage: {
      base64: purePersonBase64,
      mimeType: personImage.mimeType,
    },
  });
}
