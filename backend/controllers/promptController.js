import PromptHistory from "../models/PromptHistory.js";
import { generateGeminiResponse } from "../services/geminiService.js";

const MAX_PROMPT_LENGTH = 4000;

export const getCurrentUserPromptHistory = async (req, res) => {
  try {
    const history = await PromptHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: "Prompt history loaded successfully",
      history,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to load prompt history",
    });
  }
};

export const generatePromptForCurrentUser = async (req, res) => {
  try {
    const prompt = req.body?.prompt?.trim();
    const type = req.body?.type;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({
        message: `Prompt must be ${MAX_PROMPT_LENGTH} characters or less`,
      });
    }

    const generatedResult = await generateGeminiResponse(prompt, { type });

    const historyEntry = await PromptHistory.create({
      userId: req.user.id,
      prompt,
      response: generatedResult.response,
      images: generatedResult.images,
      responseType: generatedResult.responseType,
      model: generatedResult.model,
    });

    res.status(201).json({
      message: "Prompt generated and saved successfully",
      historyEntry,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate response";
    const lowerMessage = message.toLowerCase();
    let statusCode = 500;

    if (
      lowerMessage.includes("not configured") ||
      lowerMessage.includes("missing inference providers permission") ||
      lowerMessage.includes("invalid hugging face token")
    ) {
      statusCode = 400;
    } else if (
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("quota")
    ) {
      statusCode = 429;
    } else if (lowerMessage.includes("model is loading")) {
      statusCode = 503;
    } else if (
      lowerMessage.includes("gemini request failed") ||
      lowerMessage.includes("hugging face")
    ) {
      statusCode = 502;
    }

    res.status(statusCode).json({ message });
  }
};
