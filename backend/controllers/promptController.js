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

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({
        message: `Prompt must be ${MAX_PROMPT_LENGTH} characters or less`,
      });
    }

    const generatedResult = await generateGeminiResponse(prompt);

    const historyEntry = await PromptHistory.create({
      userId: req.user.id,
      prompt,
      response: generatedResult.response,
      model: generatedResult.model,
    });

    res.status(201).json({
      message: "Prompt generated and saved successfully",
      historyEntry,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Unable to generate response",
    });
  }
};
