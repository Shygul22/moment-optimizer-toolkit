import { pgTable, serial, text, timestamp, boolean, integer, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  priority: text("priority").notNull(), // 'high' | 'medium' | 'low'
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  estimatedDuration: integer("estimated_duration"), // minutes
  complexity: integer("complexity").notNull(), // 1-5
  impact: integer("impact").notNull(), // 1-5
  context: text("context").notNull(), // 'work' | 'personal' | 'creative' | 'administrative' | 'learning'
  energyLevel: text("energy_level").notNull(), // 'low' | 'medium' | 'high'
  aiScore: real("ai_score"),
});

export const timeSessions = pgTable("time_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // minutes
  sessionType: text("session_type").notNull(), // 'focus' | 'break' | 'planning' | 'review'
  energyLevel: integer("energy_level").notNull(), // 1-5
  focusQuality: integer("focus_quality").notNull(), // 1-5
  interruptions: integer("interruptions").default(0).notNull(),
  notes: text("notes"),
  completed: boolean("completed").default(false).notNull(),
});

export const productivityMetrics = pgTable("productivity_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  totalFocusTime: integer("total_focus_time").notNull(), // minutes
  averageFocusQuality: real("average_focus_quality").notNull(),
  tasksCompleted: integer("tasks_completed").notNull(),
  energyPattern: json("energy_pattern"), // { hour: number; level: number }[]
  peakHours: json("peak_hours"), // number[]
  productivityScore: integer("productivity_score").notNull(),
  goalAchievement: real("goal_achievement").notNull(), // percentage
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertTimeSessionSchema = createInsertSchema(timeSessions).omit({
  id: true,
});

export const insertProductivityMetricSchema = createInsertSchema(productivityMetrics).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TimeSession = typeof timeSessions.$inferSelect;
export type InsertTimeSession = z.infer<typeof insertTimeSessionSchema>;
export type ProductivityMetric = typeof productivityMetrics.$inferSelect;
export type InsertProductivityMetric = z.infer<typeof insertProductivityMetricSchema>;
