import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertTimeSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard API routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // For demo purposes, using userId = 1. In real app, get from session/auth
      const userId = 1;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/weekly-activity", async (req, res) => {
    try {
      const userId = 1;
      const activity = await storage.getWeeklyActivity(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching weekly activity:", error);
      res.status(500).json({ error: "Failed to fetch weekly activity" });
    }
  });

  // Tasks API routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const userId = 1;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const userId = 1;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateTask(id, updates);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Time sessions API routes
  app.get("/api/time-sessions", async (req, res) => {
    try {
      const userId = 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sessions = await storage.getTimeSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching time sessions:", error);
      res.status(500).json({ error: "Failed to fetch time sessions" });
    }
  });

  app.post("/api/time-sessions", async (req, res) => {
    try {
      const userId = 1;
      const sessionData = insertTimeSessionSchema.parse({ ...req.body, userId });
      const session = await storage.createTimeSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating time session:", error);
      res.status(500).json({ error: "Failed to create time session" });
    }
  });

  app.patch("/api/time-sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const session = await storage.updateTimeSession(id, updates);
      if (!session) {
        return res.status(404).json({ error: "Time session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating time session:", error);
      res.status(500).json({ error: "Failed to update time session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
