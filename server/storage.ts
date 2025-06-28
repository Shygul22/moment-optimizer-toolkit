import {
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

  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    const userTasks = Array.from(this.tasks.values()).filter(task => task.userId === userId);
    return userTasks.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createTask(task: InsertTask): Promise<Task> {
    const newTask: Task = {
      id: this.taskIdCounter++,
      userId: task.userId,
      title: task.title,
      priority: task.priority || "medium",
      completed: task.completed || false,
      createdAt: new Date(),
      dueDate: task.dueDate || null,
      estimatedDuration: task.estimatedDuration || null,
      complexity: task.complexity || 3,
      impact: task.impact || 3,
      context: task.context || "work",
      energyLevel: task.energyLevel || "medium",
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

  // Time session operations
  async getTimeSessions(userId: string, limit: number = 50): Promise<TimeSession[]> {
    const userSessions = Array.from(this.timeSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
    return userSessions;
  }

  async createTimeSession(session: InsertTimeSession): Promise<TimeSession> {
    const newSession: TimeSession = {
      id: this.sessionIdCounter++,
      userId: session.userId,
      taskId: session.taskId || null,
      startTime: session.startTime,
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

// Use in-memory storage only (completely database-free)
const storage: IStorage = new MemoryStorage();

export { storage };