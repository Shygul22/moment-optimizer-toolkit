
export interface TimeSession {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  sessionType: "focus" | "break" | "planning" | "review";
  energyLevel: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  focusQuality: 1 | 2 | 3 | 4 | 5; // 1 = very distracted, 5 = deep focus
  interruptions: number;
  notes?: string;
  completed: boolean;
}

export interface TimeBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  taskIds: string[];
  blockType: "deep-work" | "meetings" | "admin" | "break" | "learning";
  energyRequired: "low" | "medium" | "high";
  flexibility: "fixed" | "flexible" | "moveable";
  aiGenerated: boolean;
  actualStartTime?: Date;
  actualEndTime?: Date;
}

export interface ProductivityMetrics {
  date: Date;
  totalFocusTime: number; // minutes
  averageFocusQuality: number;
  tasksCompleted: number;
  energyPattern: { hour: number; level: number }[];
  peakHours: number[];
  productivityScore: number;
  goalAchievement: number; // percentage
}
