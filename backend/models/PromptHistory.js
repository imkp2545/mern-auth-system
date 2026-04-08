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
      required: true,
      trim: true,
    },
    model: {
      type: String,
      default: "gemini-2.0-flash",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PromptHistory", PromptHistorySchema);
