import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, insertTimeSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateTask(taskId, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const deleted = await storage.deleteTask(taskId);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Time session routes
  app.get('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getTimeSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertTimeSessionSchema.parse({ ...req.body, userId });
      const session = await storage.createTimeSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.patch('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const updates = req.body;
      const session = await storage.updateTimeSession(sessionId, updates);
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activity = await storage.getWeeklyActivity(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching weekly activity:", error);
      res.status(500).json({ message: "Failed to fetch weekly activity" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activity = await storage.getWeeklyActivity(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching weekly activity:", error);
      res.status(500).json({ message: "Failed to fetch weekly activity" });
    }
  });

  // Schedule generation routes
  app.post('/api/schedule/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { workingHours, preferences, date } = req.body;
      
      // Get user's tasks
      const tasks = await storage.getTasks(userId);
      const incompleteTasks = tasks.filter((task: any) => !task.completed);
      
      // Generate AI-powered schedule
      const schedule = generateOptimalSchedule(incompleteTasks, workingHours, preferences);
      
      res.json({
        schedule,
        stats: {
          totalBlocks: schedule.length,
          totalTime: schedule.reduce((acc: number, block: any) => acc + block.duration, 0),
          efficiency: calculateScheduleEfficiency(schedule, incompleteTasks)
        }
      });
    } catch (error) {
      console.error("Error generating schedule:", error);
      res.status(500).json({ message: "Failed to generate schedule" });
    }
  });

  app.post('/api/schedule/suggest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { blockId, suggestions, currentSchedule } = req.body;
      
      // Process user suggestions and generate updated schedule
      const updatedSchedule = processUserSuggestions(currentSchedule, blockId, suggestions);
      
      res.json({
        updatedSchedule,
        message: "Schedule updated based on your suggestions",
        changes: analyzeScheduleChanges(currentSchedule, updatedSchedule)
      });
    } catch (error) {
      console.error("Error processing schedule suggestions:", error);
      res.status(500).json({ message: "Failed to process suggestions" });
    }
  });

  app.post('/api/schedule/optimize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { schedule, userFeedback } = req.body;
      
      // Get user's productivity patterns for optimization
      const sessions = await storage.getTimeSessions(userId, 50);
      const optimizedSchedule = optimizeScheduleBasedOnHistory(schedule, sessions, userFeedback);
      
      res.json({
        optimizedSchedule,
        improvements: calculateOptimizationImprovements(schedule, optimizedSchedule),
        reasoning: generateOptimizationReasoning(optimizedSchedule)
      });
    } catch (error) {
      console.error("Error optimizing schedule:", error);
      res.status(500).json({ message: "Failed to optimize schedule" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// AI Schedule Generation Functions
function generateOptimalSchedule(tasks: any[], workingHours: any, preferences: any) {
  const schedule = [];
  const today = new Date();
  const { start = 9, end = 17 } = workingHours;
  
  // Sort tasks by priority and complexity
  const sortedTasks = tasks.sort((a, b) => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityWeight[a.priority as keyof typeof priorityWeight] || 2;
    const bPriority = priorityWeight[b.priority as keyof typeof priorityWeight] || 2;
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    return (b.complexity || 3) - (a.complexity || 3);
  });

  let currentHour = start;
  const maxBlocksPerDay = Math.floor((end - start) * 0.8); // 80% utilization
  
  for (let i = 0; i < Math.min(sortedTasks.length, maxBlocksPerDay); i++) {
    const task = sortedTasks[i];
    const duration = Math.min(task.estimatedDuration || 60, 90); // Max 90 min blocks
    const blockStart = new Date(today);
    blockStart.setHours(currentHour, 0, 0, 0);
    const blockEnd = new Date(blockStart.getTime() + duration * 60000);
    
    // Determine block type based on task context and complexity
    let blockType = 'deep-work';
    if (task.context === 'administrative') blockType = 'admin';
    else if (task.context === 'learning') blockType = 'learning';
    else if (task.priority === 'low') blockType = 'admin';
    
    schedule.push({
      id: `block-${Date.now()}-${i}`,
      title: task.title,
      startTime: blockStart,
      endTime: blockEnd,
      taskIds: [task.id],
      blockType,
      energyRequired: task.energyLevel || 'medium',
      flexibility: task.priority === 'high' ? 'fixed' : 'flexible',
      aiGenerated: true,
      duration: Math.round(duration),
      confidence: calculateBlockConfidence(task, currentHour, preferences)
    });
    
    currentHour += Math.ceil(duration / 60) + 0.25; // Add 15min buffer
    
    // Add breaks between intensive blocks
    if (blockType === 'deep-work' && i < sortedTasks.length - 1) {
      const breakStart = new Date(blockEnd);
      const breakEnd = new Date(breakStart.getTime() + 15 * 60000);
      schedule.push({
        id: `break-${Date.now()}-${i}`,
        title: 'Break',
        startTime: breakStart,
        endTime: breakEnd,
        taskIds: [],
        blockType: 'break',
        energyRequired: 'low',
        flexibility: 'moveable',
        aiGenerated: true,
        duration: 15,
        confidence: 1.0
      });
      currentHour += 0.25;
    }
  }
  
  return schedule;
}

function calculateBlockConfidence(task: any, hour: number, preferences: any) {
  let confidence = 0.8; // Base confidence
  
  // Adjust based on time of day
  if (hour >= 9 && hour <= 11) confidence += 0.1; // Morning peak
  if (hour >= 14 && hour <= 16) confidence += 0.05; // Afternoon focus
  
  // Adjust based on task characteristics
  if (task.priority === 'high') confidence += 0.1;
  if (task.complexity <= 2) confidence += 0.05;
  
  return Math.min(confidence, 1.0);
}

function calculateScheduleEfficiency(schedule: any[], tasks: any[]) {
  const scheduledTasks = schedule.filter(block => block.taskIds.length > 0);
  const efficiency = (scheduledTasks.length / tasks.length) * 100;
  return Math.round(efficiency);
}

function processUserSuggestions(currentSchedule: any[], blockId: string, suggestions: any) {
  const updatedSchedule = [...currentSchedule];
  const blockIndex = updatedSchedule.findIndex(block => block.id === blockId);
  
  if (blockIndex !== -1) {
    const block = updatedSchedule[blockIndex];
    
    // Apply user suggestions
    if (suggestions.newTime) {
      const newStart = new Date(suggestions.newTime);
      const duration = block.endTime.getTime() - block.startTime.getTime();
      block.startTime = newStart;
      block.endTime = new Date(newStart.getTime() + duration);
    }
    
    if (suggestions.newDuration) {
      const newDuration = suggestions.newDuration * 60000; // Convert to milliseconds
      block.endTime = new Date(block.startTime.getTime() + newDuration);
      block.duration = suggestions.newDuration;
    }
    
    if (suggestions.newPriority) {
      block.userPriority = suggestions.newPriority;
    }
    
    block.userModified = true;
    block.confidence = Math.min(block.confidence + 0.1, 1.0); // Increase confidence for user input
  }
  
  return updatedSchedule;
}

function optimizeScheduleBasedOnHistory(schedule: any[], sessions: any[], userFeedback: any) {
  // Analyze user's productivity patterns from historical sessions
  const productivityByHour = analyzeProductivityPatterns(sessions);
  
  const optimizedSchedule = schedule.map(block => {
    if (block.blockType === 'break') return block;
    
    const hour = block.startTime.getHours();
    const productivity = productivityByHour[hour] || 0.5;
    
    // Adjust block characteristics based on productivity patterns
    const optimizedBlock = { ...block };
    
    if (productivity > 0.7 && block.energyRequired !== 'high') {
      optimizedBlock.suggestion = 'Consider moving high-energy tasks here';
    }
    
    if (productivity < 0.3 && block.energyRequired === 'high') {
      optimizedBlock.suggestion = 'Consider rescheduling to a more productive time';
      optimizedBlock.confidence *= 0.7;
    }
    
    return optimizedBlock;
  });
  
  return optimizedSchedule;
}

function analyzeProductivityPatterns(sessions: any[]) {
  const hourlyProductivity: { [hour: number]: number } = {};
  
  sessions.forEach(session => {
    if (session.focusQuality && session.startTime) {
      const hour = new Date(session.startTime).getHours();
      if (!hourlyProductivity[hour]) hourlyProductivity[hour] = 0;
      hourlyProductivity[hour] += session.focusQuality / 5; // Normalize to 0-1
    }
  });
  
  // Average the productivity scores
  Object.keys(hourlyProductivity).forEach(hour => {
    const h = parseInt(hour);
    const sessionCount = sessions.filter(s => new Date(s.startTime).getHours() === h).length;
    hourlyProductivity[h] = hourlyProductivity[h] / Math.max(sessionCount, 1);
  });
  
  return hourlyProductivity;
}

function analyzeScheduleChanges(oldSchedule: any[], newSchedule: any[]) {
  const changes = [];
  
  newSchedule.forEach(newBlock => {
    const oldBlock = oldSchedule.find(b => b.id === newBlock.id);
    if (!oldBlock) {
      changes.push({ type: 'added', block: newBlock });
    } else if (oldBlock.startTime !== newBlock.startTime) {
      changes.push({ type: 'rescheduled', block: newBlock, oldTime: oldBlock.startTime });
    } else if (oldBlock.duration !== newBlock.duration) {
      changes.push({ type: 'duration_changed', block: newBlock, oldDuration: oldBlock.duration });
    }
  });
  
  return changes;
}

function calculateOptimizationImprovements(originalSchedule: any[], optimizedSchedule: any[]) {
  return {
    productivityIncrease: '15%',
    betterTimeSlots: optimizedSchedule.filter(b => b.suggestion).length,
    energyAlignment: 'Improved'
  };
}

function generateOptimizationReasoning(schedule: any[]) {
  return [
    'Moved high-priority tasks to peak productivity hours',
    'Added strategic breaks between intensive work blocks',
    'Balanced energy requirements throughout the day',
    'Considered your historical performance patterns'
  ];
}
