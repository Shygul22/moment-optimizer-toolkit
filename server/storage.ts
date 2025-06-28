import {
  users,
  tasks,
  timeSessions,
  productivityMetrics,
  coachingBookings,
  availabilitySlots,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type TimeSession,
  type InsertTimeSession,
  type ProductivityMetric,
  type InsertProductivityMetric,
  type CoachingBooking,
  type InsertCoachingBooking,
  type AvailabilitySlot,
  type InsertAvailabilitySlot,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sum, avg, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>, userId?: string): Promise<Task | undefined>;
  deleteTask(id: number, userId?: string): Promise<boolean>;
  
  // Time session operations
  getTimeSessions(userId: string, limit?: number): Promise<TimeSession[]>;
  createTimeSession(session: InsertTimeSession): Promise<TimeSession>;
  updateTimeSession(id: number, updates: Partial<InsertTimeSession>, userId?: string): Promise<TimeSession | undefined>;
  
  // Dashboard data operations
  getDashboardStats(userId: string): Promise<{
    tasksCompleted: number;
    timeTracked: number;
    focusScore: number;
    streakDays: number;
    currentSessionTime: number;
  }>;
  
  getWeeklyActivity(userId: string): Promise<{
    day: string;
    hours: number;
    tasks: number;
    productivity: number;
    trend: string;
  }[]>;

  // Coaching booking operations
  getCoachingBookings(userId?: string): Promise<CoachingBooking[]>;
  createCoachingBooking(booking: InsertCoachingBooking): Promise<CoachingBooking>;
  updateCoachingBooking(id: number, updates: Partial<InsertCoachingBooking>, userId?: string): Promise<CoachingBooking | undefined>;
  deleteCoachingBooking(id: number, userId?: string): Promise<boolean>;
  
  // Availability slot operations
  getAvailabilitySlots(date?: Date): Promise<AvailabilitySlot[]>;
  createAvailabilitySlot(slot: InsertAvailabilitySlot): Promise<AvailabilitySlot>;
  updateAvailabilitySlot(id: number, updates: Partial<InsertAvailabilitySlot>): Promise<AvailabilitySlot | undefined>;
  deleteAvailabilitySlot(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
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

  async updateTask(id: number, updates: Partial<InsertTask>, userId?: string): Promise<Task | undefined> {
    try {
      // If userId is provided, ensure user can only update their own tasks
      const whereCondition = userId 
        ? and(eq(tasks.id, id), eq(tasks.userId, userId))
        : eq(tasks.id, id);
        
      const [updatedTask] = await db
        .update(tasks)
        .set(updates)
        .where(whereCondition)
        .returning();
      return updatedTask || undefined;
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  }

  async deleteTask(id: number, userId?: string): Promise<boolean> {
    try {
      // If userId is provided, ensure user can only delete their own tasks
      const whereCondition = userId 
        ? and(eq(tasks.id, id), eq(tasks.userId, userId))
        : eq(tasks.id, id);
        
      const result = await db.delete(tasks).where(whereCondition);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Time session operations
  async getTimeSessions(userId: string, limit: number = 50): Promise<TimeSession[]> {
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

  async updateTimeSession(id: number, updates: Partial<InsertTimeSession>, userId?: string): Promise<TimeSession | undefined> {
    try {
      // If userId is provided, ensure user can only update their own sessions
      const whereCondition = userId 
        ? and(eq(timeSessions.id, id), eq(timeSessions.userId, userId))
        : eq(timeSessions.id, id);
        
      const [updatedSession] = await db
        .update(timeSessions)
        .set(updates)
        .where(whereCondition)
        .returning();
      return updatedSession || undefined;
    } catch (error) {
      console.error('Error updating time session:', error);
      return undefined;
    }
  }

  // Dashboard data operations
  async getDashboardStats(userId: string): Promise<{
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
      .select({ count: count() })
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
        totalTime: sum(timeSessions.duration),
        avgFocus: avg(timeSessions.focusQuality)
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

  async getWeeklyActivity(userId: string): Promise<{
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

  // Coaching booking operations
  async getCoachingBookings(userId?: string): Promise<CoachingBooking[]> {
    try {
      const whereCondition = userId ? eq(coachingBookings.userId, userId) : undefined;
      return await db
        .select()
        .from(coachingBookings)
        .where(whereCondition)
        .orderBy(desc(coachingBookings.createdAt));
    } catch (error) {
      console.error('Error fetching coaching bookings:', error);
      return [];
    }
  }

  async createCoachingBooking(booking: InsertCoachingBooking): Promise<CoachingBooking> {
    try {
      const [newBooking] = await db
        .insert(coachingBookings)
        .values(booking)
        .returning();
      return newBooking;
    } catch (error) {
      console.error('Error creating coaching booking:', error);
      throw error;
    }
  }

  async updateCoachingBooking(id: number, updates: Partial<InsertCoachingBooking>, userId?: string): Promise<CoachingBooking | undefined> {
    try {
      const whereCondition = userId 
        ? and(eq(coachingBookings.id, id), eq(coachingBookings.userId, userId))
        : eq(coachingBookings.id, id);
        
      const [updatedBooking] = await db
        .update(coachingBookings)
        .set({ ...updates, updatedAt: new Date() })
        .where(whereCondition)
        .returning();
      return updatedBooking || undefined;
    } catch (error) {
      console.error('Error updating coaching booking:', error);
      return undefined;
    }
  }

  async deleteCoachingBooking(id: number, userId?: string): Promise<boolean> {
    try {
      const whereCondition = userId 
        ? and(eq(coachingBookings.id, id), eq(coachingBookings.userId, userId))
        : eq(coachingBookings.id, id);
        
      const result = await db.delete(coachingBookings).where(whereCondition);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting coaching booking:', error);
      return false;
    }
  }

  // Availability slot operations
  async getAvailabilitySlots(date?: Date): Promise<AvailabilitySlot[]> {
    try {
      let whereCondition = undefined;
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        whereCondition = and(
          gte(availabilitySlots.date, startOfDay),
          lte(availabilitySlots.date, endOfDay)
        );
      }
      
      return await db
        .select()
        .from(availabilitySlots)
        .where(whereCondition)
        .orderBy(availabilitySlots.date, availabilitySlots.startTime);
    } catch (error) {
      console.error('Error fetching availability slots:', error);
      return [];
    }
  }

  async createAvailabilitySlot(slot: InsertAvailabilitySlot): Promise<AvailabilitySlot> {
    try {
      const [newSlot] = await db
        .insert(availabilitySlots)
        .values(slot)
        .returning();
      return newSlot;
    } catch (error) {
      console.error('Error creating availability slot:', error);
      throw error;
    }
  }

  async updateAvailabilitySlot(id: number, updates: Partial<InsertAvailabilitySlot>): Promise<AvailabilitySlot | undefined> {
    try {
      const [updatedSlot] = await db
        .update(availabilitySlots)
        .set(updates)
        .where(eq(availabilitySlots.id, id))
        .returning();
      return updatedSlot || undefined;
    } catch (error) {
      console.error('Error updating availability slot:', error);
      return undefined;
    }
  }

  async deleteAvailabilitySlot(id: number): Promise<boolean> {
    try {
      const result = await db.delete(availabilitySlots).where(eq(availabilitySlots.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting availability slot:', error);
      return false;
    }
  }
}

// Use in-memory storage for development when database is unavailable
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private tasks: Map<number, Task> = new Map();
  private timeSessions: Map<number, TimeSession> = new Map();
  private coachingBookings: Map<number, CoachingBooking> = new Map();
  private availabilitySlots: Map<number, AvailabilitySlot> = new Map();
  private taskIdCounter = 1;
  private sessionIdCounter = 1;
  private bookingIdCounter = 1;
  private slotIdCounter = 1;

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role || "user",
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const newTask: Task = {
      id: this.taskIdCounter++,
      userId: task.userId,
      title: task.title,
      priority: task.priority as "high" | "medium" | "low",
      completed: task.completed || false,
      createdAt: new Date(),
      dueDate: task.dueDate || null,
      estimatedDuration: task.estimatedDuration || null,
      complexity: task.complexity || 3,
      impact: task.impact || 3,
      context: (task.context as any) || "work",
      energyLevel: (task.energyLevel as any) || "medium",
      aiScore: task.aiScore || null,
    };
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>, userId?: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (task && (!userId || task.userId === userId)) {
      const updatedTask = { ...task, ...updates };
      this.tasks.set(id, updatedTask);
      return updatedTask;
    }
    return undefined;
  }

  async deleteTask(id: number, userId?: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (task && (!userId || task.userId === userId)) {
      return this.tasks.delete(id);
    }
    return false;
  }

  async getTimeSessions(userId: string, limit: number = 50): Promise<TimeSession[]> {
    return Array.from(this.timeSessions.values())
      .filter(session => session.userId === userId)
      .slice(0, limit);
  }

  async createTimeSession(session: InsertTimeSession): Promise<TimeSession> {
    const newSession: TimeSession = {
      id: this.sessionIdCounter++,
      userId: session.userId,
      taskId: session.taskId || null,
      startTime: session.startTime || new Date(),
      endTime: session.endTime || null,
      duration: session.duration || null,
      sessionType: session.sessionType as any || "focus",
      energyLevel: session.energyLevel || 3,
      focusQuality: session.focusQuality || 3,
      interruptions: session.interruptions || 0,
      notes: session.notes || null,
      completed: session.completed || false,
    };
    this.timeSessions.set(newSession.id, newSession);
    return newSession;
  }

  async updateTimeSession(id: number, updates: Partial<InsertTimeSession>, userId?: string): Promise<TimeSession | undefined> {
    const session = this.timeSessions.get(id);
    if (session && (!userId || session.userId === userId)) {
      const updatedSession = { ...session, ...updates };
      this.timeSessions.set(id, updatedSession);
      return updatedSession;
    }
    return undefined;
  }

  async getDashboardStats(userId: string): Promise<{
    tasksCompleted: number;
    timeTracked: number;
    focusScore: number;
    streakDays: number;
    currentSessionTime: number;
  }> {
    const userTasks = Array.from(this.tasks.values()).filter(task => task.userId === userId);
    const userSessions = Array.from(this.timeSessions.values()).filter(session => session.userId === userId);
    
    return {
      tasksCompleted: userTasks.filter(task => task.completed).length,
      timeTracked: userSessions.reduce((total, session) => total + (session.duration || 0), 0),
      focusScore: 85,
      streakDays: 3,
      currentSessionTime: 0,
    };
  }

  async getWeeklyActivity(userId: string): Promise<{
    day: string;
    hours: number;
    tasks: number;
    productivity: number;
    trend: string;
  }[]> {
    return [
      { day: "Mon", hours: 6.5, tasks: 8, productivity: 85, trend: "up" },
      { day: "Tue", hours: 7.2, tasks: 12, productivity: 92, trend: "up" },
      { day: "Wed", hours: 5.8, tasks: 6, productivity: 78, trend: "down" },
      { day: "Thu", hours: 8.1, tasks: 15, productivity: 95, trend: "up" },
      { day: "Fri", hours: 6.9, tasks: 9, productivity: 88, trend: "up" },
      { day: "Sat", hours: 3.2, tasks: 4, productivity: 70, trend: "down" },
      { day: "Sun", hours: 2.1, tasks: 2, productivity: 60, trend: "down" },
    ];
  }

  // Coaching booking operations
  async getCoachingBookings(userId?: string): Promise<CoachingBooking[]> {
    const bookings = Array.from(this.coachingBookings.values());
    return userId ? bookings.filter(booking => booking.userId === userId) : bookings;
  }

  async createCoachingBooking(booking: InsertCoachingBooking): Promise<CoachingBooking> {
    const newBooking: CoachingBooking = {
      id: this.bookingIdCounter++,
      userId: booking.userId,
      title: booking.title,
      description: booking.description || null,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      duration: booking.duration || 30,
      status: booking.status || "pending",
      adminNotes: booking.adminNotes || null,
      meetingLink: booking.meetingLink || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coachingBookings.set(newBooking.id, newBooking);
    return newBooking;
  }

  async updateCoachingBooking(id: number, updates: Partial<InsertCoachingBooking>, userId?: string): Promise<CoachingBooking | undefined> {
    const booking = this.coachingBookings.get(id);
    if (booking && (!userId || booking.userId === userId)) {
      const updatedBooking = { ...booking, ...updates, updatedAt: new Date() };
      this.coachingBookings.set(id, updatedBooking);
      return updatedBooking;
    }
    return undefined;
  }

  async deleteCoachingBooking(id: number, userId?: string): Promise<boolean> {
    const booking = this.coachingBookings.get(id);
    if (booking && (!userId || booking.userId === userId)) {
      return this.coachingBookings.delete(id);
    }
    return false;
  }

  // Availability slot operations
  async getAvailabilitySlots(date?: Date): Promise<AvailabilitySlot[]> {
    const slots = Array.from(this.availabilitySlots.values());
    if (date) {
      const targetDate = date.toDateString();
      return slots.filter(slot => slot.date.toDateString() === targetDate);
    }
    return slots;
  }

  async createAvailabilitySlot(slot: InsertAvailabilitySlot): Promise<AvailabilitySlot> {
    const newSlot: AvailabilitySlot = {
      id: this.slotIdCounter++,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked: slot.isBooked || false,
      bookingId: slot.bookingId || null,
      createdAt: new Date(),
    };
    this.availabilitySlots.set(newSlot.id, newSlot);
    return newSlot;
  }

  async updateAvailabilitySlot(id: number, updates: Partial<InsertAvailabilitySlot>): Promise<AvailabilitySlot | undefined> {
    const slot = this.availabilitySlots.get(id);
    if (slot) {
      const updatedSlot = { ...slot, ...updates };
      this.availabilitySlots.set(id, updatedSlot);
      return updatedSlot;
    }
    return undefined;
  }

  async deleteAvailabilitySlot(id: number): Promise<boolean> {
    return this.availabilitySlots.delete(id);
  }
}

// Use Supabase database storage directly (migrated from Replit database)
const storage: IStorage = new DatabaseStorage();

export { storage };
