import User from "../models/User.js";
import WorkspaceProfile from "../models/WorkspaceProfile.js";

const sanitizeWorkspaceProfile = (profile) => {
  const source = profile ?? {};

  return {
    fullName: source.fullName || "",
    workType: source.workType || "",
    role: source.role || "",
    teamSize: source.teamSize || "",
    helpTopic: source.helpTopic || "",
    betaFeedback: source.betaFeedback || "",
    marketingConsent: Boolean(source.marketingConsent),
  };
};

const isWorkspaceProfileComplete = (profile) =>
  Boolean(
    profile.fullName.trim() &&
      profile.workType &&
      profile.role &&
      profile.teamSize &&
      profile.helpTopic &&
      profile.betaFeedback
  );

export const getCurrentWorkspaceProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const workspaceProfile = await WorkspaceProfile.findOne({ userId: user._id });

    res.json({
      message: "Workspace profile loaded successfully",
      profile: sanitizeWorkspaceProfile(workspaceProfile),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to load workspace profile",
    });
  }
};

export const upsertCurrentWorkspaceProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextProfile = sanitizeWorkspaceProfile(req.body);

    if (!isWorkspaceProfileComplete(nextProfile)) {
      return res.status(400).json({
        message: "Please complete all workspace form fields before submitting",
      });
    }

    user.name = nextProfile.fullName.trim();
    await user.save();

    const workspaceProfile = await WorkspaceProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          ...nextProfile,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      message: "Form submitted successfully and saved to WorkspaceProfile",
      profile: sanitizeWorkspaceProfile(workspaceProfile),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to save workspace profile",
    });
  }
};
