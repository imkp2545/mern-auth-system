import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  googleAuth,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);

// Protected route
router.get("/profile", authMiddleware, getProfile);

export default router;
