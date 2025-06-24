export interface ProductivityTrend {
  date: Date;
  focusTime: number; // minutes
  tasksCompleted: number;
  focusQuality: number; // 1-5
  energyLevel: number; // 1-5
  productivityScore: number; // 0-100
  contextSwitches: number;
  distractionsCount: number;
  goalProgress: number; // percentage
}

export interface BehaviorPattern {
  id: string;
  type: "work-pattern" | "energy-cycle" | "procrastination" | "peak-performance";
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  strength: number; // 0-1 confidence
  triggers: string[];
  outcomes: string[];
  recommendations: string[];
  firstDetected: Date;
  lastSeen: Date;
}

export interface PeakPerformanceAnalysis {
  optimalWorkHours: { start: number; end: number }[];
  bestTaskTypes: { [hour: number]: string[] };
  energyPeaks: { hour: number; energyLevel: number }[];
  focusQualityByHour: { hour: number; quality: number }[];
  productivityFactors: ProductivityFactor[];
}

export interface ProductivityFactor {
  factor: string;
  impact: number; // -1 to 1
  confidence: number; // 0-1
  examples: string[];
}

export interface GoalProgress {
  goalId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  category: "productivity" | "focus" | "tasks" | "habits" | "learning";
  trend: "improving" | "declining" | "stable";
  predictedCompletion?: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  achievedAt?: Date;
  isCompleted: boolean;
}

export interface ProductivityForecast {
  date: Date;
  predictedProductivity: number; // 0-100
  confidence: number; // 0-1
  factors: string[];
  recommendations: string[];
  riskFactors: string[];
}

export interface WorkLifeBalance {
  workHours: number;
  personalHours: number;
  focusedWork: number;
  breakTime: number;
  overTimeHours: number;
  wellnessScore: number; // 0-100
  burnoutRisk: "low" | "medium" | "high";
  recommendations: string[];
}

export interface HabitFormation {
  habitId: string;
  name: string;
  category: "productivity" | "health" | "learning" | "focus";
  targetFrequency: number; // per week
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // 0-1
  difficulty: 1 | 2 | 3 | 4 | 5;
  triggers: string[];
  barriers: string[];
  rewards: string[];
  formationStage: "forming" | "developing" | "established" | "automatic";
}

export interface ContextSwitchAnalysis {
  switchesPerHour: number;
  averageFocusBlockDuration: number;
  costOfSwitching: number; // productivity loss in minutes
  mostCommonSwitches: { from: string; to: string; frequency: number }[];
  switchingTriggers: string[];
  optimalSwitchingPatterns: string[];
}

export interface ProcastinationAnalysis {
  procrastinationScore: number; // 0-100
  commonTriggers: string[];
  avoidedTaskTypes: string[];
  procrastinationPatterns: { time: string; frequency: number }[];
  interventionStrategies: string[];
  successfulOvercomes: { strategy: string; effectiveness: number }[];
}