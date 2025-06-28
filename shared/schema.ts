import { z } from "zod";

// User types
export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UpsertUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string;
}

// Task types
export interface Task {
  id: number;
  userId: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  createdAt: Date | null;
  dueDate: Date | null;
  estimatedDuration: number | null;
  complexity: number | null;
  impact: number | null;
  context: string | null;
  energyLevel: string | null;
  aiScore: number | null;
}

export const insertTaskSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(500),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  completed: z.boolean().default(false),
  dueDate: z.date().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  complexity: z.number().int().min(1).max(5).default(3),
  impact: z.number().int().min(1).max(5).default(3),
  context: z.string().max(50).default("work"),
  energyLevel: z.enum(["low", "medium", "high"]).default("medium"),
  aiScore: z.number().optional(),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;

// Time session types
export interface TimeSession {
  id: number;
  userId: string;
  taskId: number | null;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  sessionType: "focus" | "break" | "planning" | "review";
  energyLevel: number | null;
  focusQuality: number | null;
  interruptions: number | null;
  notes: string | null;
  completed: boolean;
}

export const insertTimeSessionSchema = z.object({
  userId: z.string(),
  taskId: z.number().int().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().int().optional(),
  sessionType: z.enum(["focus", "break", "planning", "review"]).default("focus"),
  energyLevel: z.number().int().min(1).max(5).default(3),
  focusQuality: z.number().int().min(1).max(5).default(3),
  interruptions: z.number().int().min(0).default(0),
  notes: z.string().optional(),
  completed: z.boolean().default(false),
});

export type InsertTimeSession = z.infer<typeof insertTimeSessionSchema>;

// Productivity metrics types
export interface ProductivityMetric {
  id: number;
  userId: string;
  date: Date;
  totalFocusTime: number | null;
  averageFocusQuality: number | null;
  tasksCompleted: number | null;
  productivityScore: number | null;
  goalAchievement: number | null;
}

export const insertProductivityMetricSchema = z.object({
  userId: z.string(),
  date: z.date(),
  totalFocusTime: z.number().int().min(0).default(0),
  averageFocusQuality: z.number().optional(),
  tasksCompleted: z.number().int().min(0).default(0),
  productivityScore: z.number().optional(),
  goalAchievement: z.number().optional(),
});

export type InsertProductivityMetric = z.infer<typeof insertProductivityMetricSchema>;

// Coaching booking types
export interface CoachingBooking {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  preferredDate: Date;
  preferredTime: string;
  duration: number | null;
  status: string;
  adminNotes: string | null;
  meetingLink: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export const insertCoachingBookingSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  preferredDate: z.date(),
  preferredTime: z.string(),
  duration: z.number().int().positive().default(30),
  status: z.string().default("pending"),
  adminNotes: z.string().optional(),
  meetingLink: z.string().optional(),
});

export type InsertCoachingBooking = z.infer<typeof insertCoachingBookingSchema>;

// Availability slot types
export interface AvailabilitySlot {
  id: number;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean | null;
  bookingId: number | null;
  createdAt: Date | null;
}

export const insertAvailabilitySlotSchema = z.object({
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  isBooked: z.boolean().default(false),
  bookingId: z.number().int().optional(),
});

export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;