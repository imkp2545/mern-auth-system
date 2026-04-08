import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getCurrentWorkspaceProfile,
  upsertCurrentWorkspaceProfile,
} from "../controllers/userController.js";
import {
  createCurrentUserTask,
  getCurrentUserTasks,
} from "../controllers/taskController.js";
import {
  generatePromptForCurrentUser,
  getCurrentUserPromptHistory,
} from "../controllers/promptController.js";

const router = express.Router();

router.get("/me/workspace-profile", authMiddleware, getCurrentWorkspaceProfile);
router.put("/me/workspace-profile", authMiddleware, upsertCurrentWorkspaceProfile);
router.get("/me/tasks", authMiddleware, getCurrentUserTasks);
router.post("/me/tasks", authMiddleware, createCurrentUserTask);
router.get("/me/prompt-history", authMiddleware, getCurrentUserPromptHistory);
router.post("/me/prompt-history", authMiddleware, generatePromptForCurrentUser);

export default router;
