import mongoose from "mongoose";

const PromptHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    response: {
      type: String,
      default: "",
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    responseType: {
      type: String,
      enum: ["text", "image", "mixed"],
      default: "text",
      trim: true,
    },
    model: {
      type: String,
      default: "gemini-2.5-flash",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PromptHistory", PromptHistorySchema);
