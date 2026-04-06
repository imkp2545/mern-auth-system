import mongoose from "mongoose";

const WorkspaceProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    workType: {
      type: String,
      enum: ["agency", "freelancer", ""],
      default: "",
    },
    role: {
      type: String,
      default: "",
      trim: true,
    },
    teamSize: {
      type: String,
      default: "",
      trim: true,
    },
    helpTopic: {
      type: String,
      default: "",
      trim: true,
    },
    betaFeedback: {
      type: String,
      default: "",
      trim: true,
    },
    marketingConsent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkspaceProfile", WorkspaceProfileSchema);
