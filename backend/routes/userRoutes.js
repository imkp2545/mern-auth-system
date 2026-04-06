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

const router = express.Router();

router.get("/me/workspace-profile", authMiddleware, getCurrentWorkspaceProfile);
router.put("/me/workspace-profile", authMiddleware, upsertCurrentWorkspaceProfile);
router.get("/me/tasks", authMiddleware, getCurrentUserTasks);
router.post("/me/tasks", authMiddleware, createCurrentUserTask);

export default router;
