
// Note: TimeSession is now imported from @shared/schema to ensure consistency

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
