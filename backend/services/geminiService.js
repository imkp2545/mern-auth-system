const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_HF_IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell";
const DEFAULT_HF_IMAGE_BASE_URL =
  "https://router.huggingface.co/hf-inference/models";

const IMAGE_PROMPT_REGEX =
  /\b(image|picture|photo|illustration|art|logo|icon|poster|wallpaper|draw|sketch|render)\b/i;
const CODE_REVIEW_PROMPT_REGEX =
  /\b(code review|review code|analyze code|audit code|check this code)\b/i;

const getRequiredEnv = (name, description) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured on the server (${description}).`);
  }

  return value;
};

const getGeminiApiKey = () => getRequiredEnv("GEMINI_API_KEY", "Gemini text/code");
const getHuggingFaceApiKey = () =>
  getRequiredEnv("HF_API_KEY", "Hugging Face image generation");

const getTextModelCandidates = () => {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const fallbacks = [
    configuredModel,
    DEFAULT_GEMINI_MODEL,
    "gemini-flash-latest",
    "gemini-2.0-flash",
  ].filter(Boolean);

  return [...new Set(fallbacks)];
};
const getImageModelCandidates = () => {
  const configuredModel = process.env.HF_IMAGE_MODEL?.trim();
  const fallbacks = [
    configuredModel,
    DEFAULT_HF_IMAGE_MODEL,
    "stabilityai/stable-diffusion-2",
  ].filter(Boolean);

  return [...new Set(fallbacks)];
};
const getImageBaseUrl = () =>
  process.env.HF_IMAGE_BASE_URL?.trim() || DEFAULT_HF_IMAGE_BASE_URL;

const parseGeminiCandidateParts = (data) => {
  const parts =
    data?.candidates?.flatMap((candidate) => candidate?.content?.parts || []) ||
    [];

  const responseText = parts
    .map((part) => part?.text || "")
    .join("")
    .trim();

  const images = parts
    .filter((part) => part?.inlineData?.data)
    .map((part) => {
      const mimeType = part.inlineData.mimeType || "image/png";
      return `data:${mimeType};base64,${part.inlineData.data}`;
    });

  return {
    responseText,
    images,
  };
};

const resolvePromptType = (prompt, explicitType) => {
  const normalizedType = String(explicitType || "")
    .trim()
    .toLowerCase();

  if (normalizedType === "image") {
    return "image";
  }

  if (normalizedType === "code-review" || normalizedType === "review") {
    return "code-review";
  }

  if (normalizedType === "text") {
    return "text";
  }

  if (IMAGE_PROMPT_REGEX.test(prompt)) {
    return "image";
  }

  if (CODE_REVIEW_PROMPT_REGEX.test(prompt)) {
    return "code-review";
  }

  return "text";
};

const buildCodeReviewPrompt = (prompt) =>
  `You are a senior software engineer performing a code review.
Focus on bugs, security, performance, readability, and missing tests.
Provide concise, actionable feedback and an improved snippet when useful.

Code or request to review:
${prompt}`;

const requestGeminiGenerateContent = async ({
  apiKey,
  model,
  prompt,
  maxOutputTokens,
}) => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  const errorMessage =
    data?.error?.message ||
    `Gemini request failed with status ${response.status}.`;

  return {
    ok: response.ok,
    status: response.status,
    data,
    errorMessage,
  };
};

const isRetryableTextModelFailure = (errorInfo) => {
  const message = String(errorInfo?.errorMessage || "").toLowerCase();

  return (
    errorInfo?.status === 400 ||
    errorInfo?.status === 404 ||
    message.includes("not found") ||
    message.includes("not supported") ||
    message.includes("unsupported")
  );
};

const formatTextFailure = (lastError, attemptedModels) =>
  `Unable to generate text with models: ${attemptedModels.join(
    ", "
  )}. Last error: ${lastError?.errorMessage || "Unknown error"}`;

const generateGeminiTextResponse = async (prompt, promptType) => {
  const apiKey = getGeminiApiKey();
  const reviewedPrompt =
    promptType === "code-review" ? buildCodeReviewPrompt(prompt) : prompt;
  const textModels = getTextModelCandidates();
  let lastError = null;

  for (const model of textModels) {
    const result = await requestGeminiGenerateContent({
      apiKey,
      model,
      prompt: reviewedPrompt,
      maxOutputTokens: promptType === "code-review" ? 2048 : 1024,
    });

    if (!result.ok) {
      lastError = result;

      if (isRetryableTextModelFailure(result)) {
        continue;
      }

      throw new Error(result.errorMessage);
    }

    const { responseText, images } = parseGeminiCandidateParts(result.data);

    if (!responseText && images.length === 0) {
      lastError = {
        status: 200,
        errorMessage: `Model ${model} did not return any content.`,
      };
      continue;
    }

    return {
      model,
      response:
        responseText ||
        (promptType === "code-review"
          ? "Code review generated successfully."
          : "Response generated successfully."),
      images,
      responseType: images.length ? "mixed" : "text",
    };
  }

  throw new Error(formatTextFailure(lastError, textModels));
};

const parseHuggingFaceError = async (response, model) => {
  const contentType = response.headers.get("content-type") || "";
  let payload = {};
  let rawBody = "";

  if (contentType.includes("application/json")) {
    payload = await response.json().catch(() => ({}));
  } else {
    rawBody = await response.text().catch(() => "");
  }

  const fallbackMessage = `Hugging Face request failed with status ${response.status}.`;
  const message =
    payload?.error ||
    payload?.message ||
    payload?.estimated_time ||
    rawBody ||
    fallbackMessage;
  const lowerMessage = String(message).toLowerCase();

  if (response.status === 401 || response.status === 403) {
    if (
      lowerMessage.includes("inference providers") ||
      lowerMessage.includes("sufficient permissions")
    ) {
      return "Hugging Face token is missing Inference Providers permission. Create a token with that permission and update HF_API_KEY.";
    }

    return "Invalid Hugging Face token or permission denied.";
  }

  if (response.status === 429 || lowerMessage.includes("rate limit")) {
    return "Hugging Face rate limit reached. Please retry shortly.";
  }

  if (response.status === 503 || lowerMessage.includes("loading")) {
    return "Hugging Face model is loading. Retry in a few moments.";
  }

  if (response.status === 410 || lowerMessage.includes("no longer supported")) {
    return "Your Hugging Face endpoint is deprecated. Use router.huggingface.co/hf-inference/models/{model}.";
  }

  if (response.status === 404 || lowerMessage.includes("not found")) {
    return `Hugging Face image model '${model}' is not available on the hf-inference router.`;
  }

  return String(message);
};

const isRetryableImageModelFailure = (errorInfo) => {
  const message = String(errorInfo?.errorMessage || "").toLowerCase();

  return (
    errorInfo?.status === 404 ||
    message.includes("not available") ||
    message.includes("not found") ||
    message.includes("does not exist")
  );
};

const formatImageFailure = (lastError, attemptedModels) =>
  `Unable to generate image with models: ${attemptedModels.join(
    ", "
  )}. Last error: ${lastError?.errorMessage || "Unknown error"}`;

const generateHuggingFaceImage = async (prompt) => {
  const apiKey = getHuggingFaceApiKey();
  const imageModels = getImageModelCandidates();
  const baseUrl = getImageBaseUrl().replace(/\/+$/, "");
  let lastError = null;

  for (const model of imageModels) {
    const endpoint = `${baseUrl}/${model}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: {
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const message = await parseHuggingFaceError(response, model);
      lastError = {
        status: response.status,
        errorMessage: message,
      };

      if (isRetryableImageModelFailure(lastError)) {
        continue;
      }

      throw new Error(message);
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const payload = await response.json().catch(() => ({}));
      lastError = {
        status: 200,
        errorMessage:
          payload?.error || "Hugging Face did not return image binary data.",
      };
      continue;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    if (!imageBuffer.length) {
      lastError = {
        status: 200,
        errorMessage: "Hugging Face returned an empty image response.",
      };
      continue;
    }

    const mimeType = contentType.startsWith("image/")
      ? contentType.split(";")[0]
      : "image/png";
    const dataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

    return {
      model,
      response: "Image generated successfully.",
      images: [dataUrl],
      responseType: "image",
    };
  }

  throw new Error(formatImageFailure(lastError, imageModels));
};

export const generateGeminiResponse = async (prompt, options = {}) => {
  const promptType = resolvePromptType(prompt, options.type);

  if (promptType === "image") {
    return generateHuggingFaceImage(prompt);
  }

  return generateGeminiTextResponse(prompt, promptType);
};
