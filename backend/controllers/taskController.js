import Task from "../models/Task.js";

export const getCurrentUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: "Tasks loaded successfully",
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unable to load tasks",
    });
  }
};

export const createCurrentUserTask = async (req, res) => {
  try {
    const title = req.body?.title?.trim();

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await Task.create({
      userId: req.user.id,
      title,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unable to create task",
    });
  }
};
