export interface FocusSession {
  id: string;
  taskId?: string;
  type: "pomodoro" | "deep-work" | "creative" | "learning" | "admin";
  plannedDuration: number; // minutes
  actualDuration?: number;
  startTime: Date;
  endTime?: Date;
  breakDuration: number; // minutes
  energyBefore: 1 | 2 | 3 | 4 | 5;
  energyAfter?: 1 | 2 | 3 | 4 | 5;
  focusQuality: 1 | 2 | 3 | 4 | 5;
  distractions: Distraction[];
  techniques: FocusTechnique[];
  environmentFactors: EnvironmentFactors;
  completed: boolean;
  aiRecommendations: AIRecommendation[];
}

export interface Distraction {
  id: string;
  type: "notification" | "interruption" | "internal" | "environmental";
  source: string;
  timestamp: Date;
  duration: number; // seconds
  handled: boolean;
}

export interface FocusTechnique {
  id: string;
  name: string;
  type: "breathing" | "meditation" | "music" | "environment" | "cognitive";
  effectiveness: 1 | 2 | 3 | 4 | 5;
  usageCount: number;
}

export interface EnvironmentFactors {
  noise: 1 | 2 | 3 | 4 | 5; // 1 = very quiet, 5 = very noisy
  lighting: "dim" | "normal" | "bright" | "natural";
  temperature: "cold" | "cool" | "comfortable" | "warm" | "hot";
  location: "home" | "office" | "cafe" | "library" | "other";
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
}

export interface AIRecommendation {
  id: string;
  type: "session-length" | "break-timing" | "technique" | "environment" | "schedule";
  title: string;
  description: string;
  confidence: number; // 0-1
  reasoning: string;
  applied: boolean;
  effectiveness?: number; // 1-5 if applied
}

export interface FocusPattern {
  userId: string;
  optimalSessionLength: { [key in FocusSession["type"]]: number };
  optimalBreakLength: { [key in FocusSession["type"]]: number };
  peakFocusHours: number[];
  fatigueCurve: { hour: number; fatigueLevel: number }[];
  preferredTechniques: FocusTechnique[];
  environmentPreferences: EnvironmentFactors;
  contextSwitchingFrequency: number;
  averageFocusQuality: number;
  procrastinationTriggers: string[];
}

export interface AdaptivePomodoroSettings {
  baseWorkDuration: number; // 25 minutes default
  baseBreakDuration: number; // 5 minutes default
  longBreakDuration: number; // 15 minutes default
  longBreakInterval: number; // every 4 sessions
  adaptationEnabled: boolean;
  energyBasedAdjustment: boolean;
  taskComplexityAdjustment: boolean;
  progressiveDifficulty: boolean;
  maxWorkDuration: number; // 90 minutes max
  minWorkDuration: number; // 15 minutes min
}