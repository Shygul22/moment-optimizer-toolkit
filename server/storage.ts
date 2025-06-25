import { 
  users, 
  tasks, 
  timeSessions, 
  productivityMetrics,
  type User, 
  type InsertUser,
  type Task,
  type InsertTask,
  type TimeSession,
  type InsertTimeSession,
  type ProductivityMetric,
  type InsertProductivityMetric
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Time session methods
  getTimeSessions(userId: number, limit?: number): Promise<TimeSession[]>;
  createTimeSession(session: InsertTimeSession): Promise<TimeSession>;
  updateTimeSession(id: number, updates: Partial<InsertTimeSession>): Promise<TimeSession | undefined>;
  
  // Dashboard data methods
  getDashboardStats(userId: number): Promise<{
    tasksCompleted: number;
    timeTracked: number;
    focusScore: number;
    streakDays: number;
    currentSessionTime: number;
  }>;
  
  getWeeklyActivity(userId: number): Promise<{
    day: string;
    hours: number;
    tasks: number;
    productivity: number;
    trend: string;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    try {
      return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async createTask(task: InsertTask): Promise<Task> {
    try {
      const [newTask] = await db
        .insert(tasks)
        .values(task)
        .returning();
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    try {
      const [updatedTask] = await db
        .update(tasks)
        .set(updates)
        .where(eq(tasks.id, id))
        .returning();
      return updatedTask || undefined;
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      const result = await db.delete(tasks).where(eq(tasks.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Time session methods
  async getTimeSessions(userId: number, limit: number = 50): Promise<TimeSession[]> {
    try {
      return await db
        .select()
        .from(timeSessions)
        .where(eq(timeSessions.userId, userId))
        .orderBy(desc(timeSessions.startTime))
        .limit(limit);
    } catch (error) {
      console.error('Error fetching time sessions:', error);
      return [];
    }
  }

  async createTimeSession(session: InsertTimeSession): Promise<TimeSession> {
    try {
      const [newSession] = await db
        .insert(timeSessions)
        .values(session)
        .returning();
      return newSession;
    } catch (error) {
      console.error('Error creating time session:', error);
      throw error;
    }
  }

  async updateTimeSession(id: number, updates: Partial<InsertTimeSession>): Promise<TimeSession | undefined> {
    try {
      const [updatedSession] = await db
        .update(timeSessions)
        .set(updates)
        .where(eq(timeSessions.id, id))
        .returning();
      return updatedSession || undefined;
    } catch (error) {
      console.error('Error updating time session:', error);
      return undefined;
    }
  }

  // Dashboard data methods
  async getDashboardStats(userId: number): Promise<{
    tasksCompleted: number;
    timeTracked: number;
    focusScore: number;
    streakDays: number;
    currentSessionTime: number;
  }> {
    try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's completed tasks
    const [tasksResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, true),
          gte(tasks.createdAt, today),
          lte(tasks.createdAt, tomorrow)
        )
      );

    // Get today's total focus time
    const [timeResult] = await db
      .select({ 
        totalTime: sql<number>`sum(duration)`,
        avgFocus: sql<number>`avg(focus_quality)`
      })
      .from(timeSessions)
      .where(
        and(
          eq(timeSessions.userId, userId),
          gte(timeSessions.startTime, today),
          lte(timeSessions.startTime, tomorrow),
          eq(timeSessions.completed, true)
        )
      );

    // Calculate streak days (count consecutive days with completed sessions)
    const streakQuery = await db
      .select({ 
        date: sql<string>`date(start_time)`,
        hasActivity: sql<number>`count(*)`
      })
      .from(timeSessions)
      .where(
        and(
          eq(timeSessions.userId, userId),
          eq(timeSessions.completed, true)
        )
      )
      .groupBy(sql`date(start_time)`)
      .orderBy(sql`date(start_time) desc`)
      .limit(30);

    let streakDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const result of streakQuery) {
      const resultDate = new Date(result.date);
      resultDate.setHours(0, 0, 0, 0);
      
      if (resultDate.getTime() === currentDate.getTime() && result.hasActivity > 0) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Get current session time (active session)
    const [currentSession] = await db
      .select()
      .from(timeSessions)
      .where(
        and(
          eq(timeSessions.userId, userId),
          eq(timeSessions.completed, false)
        )
      )
      .orderBy(desc(timeSessions.startTime))
      .limit(1);

    let currentSessionTime = 0;
    if (currentSession) {
      const now = new Date();
      currentSessionTime = Math.floor((now.getTime() - currentSession.startTime.getTime()) / 60000);
    }

    return {
      tasksCompleted: Number(tasksResult?.count) || 0,
      timeTracked: Number(timeResult?.totalTime) || 0,
      focusScore: Math.round(Number(timeResult?.avgFocus) || 75),
      streakDays,
      currentSessionTime
    };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        tasksCompleted: 0,
        timeTracked: 0,
        focusScore: 75,
        streakDays: 0,
        currentSessionTime: 0
      };
    }
  }

  async getWeeklyActivity(userId: number): Promise<{
    day: string;
    hours: number;
    tasks: number;
    productivity: number;
    trend: string;
  }[]> {
    try {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const result = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Get day's sessions
        const [sessionsResult] = await db
          .select({ 
            totalTime: sql<number>`sum(duration)`,
            avgFocus: sql<number>`avg(focus_quality)`
          })
          .from(timeSessions)
          .where(
            and(
              eq(timeSessions.userId, userId),
              gte(timeSessions.startTime, date),
              lte(timeSessions.startTime, nextDay),
              eq(timeSessions.completed, true)
            )
          );

        // Get day's completed tasks
        const [tasksResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(tasks)
          .where(
            and(
              eq(tasks.userId, userId),
              eq(tasks.completed, true),
              gte(tasks.createdAt, date),
              lte(tasks.createdAt, nextDay)
            )
          );

        const hours = (Number(sessionsResult?.totalTime) || 0) / 60;
        const taskCount = Number(tasksResult?.count) || 0;
        const productivity = Math.round(Number(sessionsResult?.avgFocus) || 60);
        
        // Simple trend calculation
        let trend = 'stable';
        if (i > 0) {
          const prevProductivity = result[i - 1]?.productivity || productivity;
          if (productivity > prevProductivity + 5) trend = 'up';
          else if (productivity < prevProductivity - 5) trend = 'down';
        }

        result.push({
          day: days[date.getDay()],
          hours: Math.round(hours * 10) / 10,
          tasks: taskCount,
          productivity,
          trend
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching weekly activity:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
