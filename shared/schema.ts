import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  serial,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  priority: varchar("priority", { length: 10 }).notNull().default("medium"), // high, medium, low
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  dueDate: timestamp("due_date"),
  estimatedDuration: integer("estimated_duration"), // in minutes
  complexity: integer("complexity").default(3), // 1-5
  impact: integer("impact").default(3), // 1-5
  context: varchar("context", { length: 50 }).default("work"), // work, personal, creative, administrative, learning
  energyLevel: varchar("energy_level", { length: 10 }).default("medium"), // low, medium, high
  aiScore: decimal("ai_score", { precision: 5, scale: 2 }),
});

// Time sessions table
export const timeSessions = pgTable("time_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "set null" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  sessionType: varchar("session_type", { length: 20 }).notNull().default("focus"), // focus, break, planning, review
  energyLevel: integer("energy_level").default(3), // 1-5
  focusQuality: integer("focus_quality").default(3), // 1-5
  interruptions: integer("interruptions").default(0),
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
});

// Productivity metrics table
export const productivityMetrics = pgTable("productivity_metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  totalFocusTime: integer("total_focus_time").default(0), // minutes
  averageFocusQuality: decimal("average_focus_quality", { precision: 3, scale: 2 }),
  tasksCompleted: integer("tasks_completed").default(0),
  productivityScore: decimal("productivity_score", { precision: 5, scale: 2 }),
  goalAchievement: decimal("goal_achievement", { precision: 5, scale: 2 }), // percentage
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

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TimeSession = typeof timeSessions.$inferSelect;
export type InsertTimeSession = z.infer<typeof insertTimeSessionSchema>;
export type ProductivityMetric = typeof productivityMetrics.$inferSelect;
export type InsertProductivityMetric = z.infer<typeof insertProductivityMetricSchema>;
