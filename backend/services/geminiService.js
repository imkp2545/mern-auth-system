const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

const extractTextFromCandidate = (candidate) =>
  candidate?.content?.parts
    ?.map((part) => part?.text || "")
    .join("")
    .trim();

export const getGeminiModel = () =>
  process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

export const generateGeminiResponse = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const model = getGeminiModel();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Gemini request failed. Please try again."
    );
  }

  const generatedText = data?.candidates
    ?.map(extractTextFromCandidate)
    .find(Boolean);

  if (!generatedText) {
    throw new Error("Gemini did not return any text for this prompt.");
  }

  return {
    model,
    response: generatedText,
  };
};
