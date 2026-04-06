import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildAuthPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  authProvider: user.authProvider,
});

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      ...buildAuthPayload(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "This account uses Google sign-in. Continue with Google instead.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      ...buildAuthPayload(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  PROTECTED ROUTE TEST
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: "Account loaded successfully",
    user: buildAuthPayload(user),
  });
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, mode = "login" } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message: "Google auth is not configured on the server.",
      });
    }

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.name) {
      return res.status(400).json({ message: "Invalid Google account data" });
    }

    if (!payload.email_verified) {
      return res.status(400).json({
        message: "Google account email is not verified",
      });
    }

    const normalizedEmail = payload.email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    let isNewGoogleUser = false;

    if (user && user.authProvider === "local") {
      return res.status(409).json({
        message:
          "An email/password account already exists for this email. Sign in with your password instead.",
      });
    }

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: normalizedEmail,
        authProvider: "google",
        googleId: payload.sub,
        avatar: payload.picture || "",
      });
      isNewGoogleUser = true;
    } else {
      user.name = payload.name;
      user.googleId = payload.sub;
      user.avatar = payload.picture || user.avatar || "";
      user.authProvider = "google";
      await user.save();
    }

    res.json({
      ...buildAuthPayload(user),
      token: generateToken(user._id),
      isNewGoogleUser,
      message:
        isNewGoogleUser
          ? "Google sign-up successful."
          : mode === "register"
            ? "Google account already existed, and you have been signed in."
            : "Google login successful.",
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Google authentication failed",
    });
  }
};
