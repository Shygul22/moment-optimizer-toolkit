
export interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  // AI-powered fields
  estimatedDuration?: number; // in minutes
  complexity: 1 | 2 | 3 | 4 | 5; // 1 = very simple, 5 = very complex
  impact: 1 | 2 | 3 | 4 | 5; // 1 = low impact, 5 = high impact
  context: "work" | "personal" | "creative" | "administrative" | "learning";
  energyLevel: "low" | "medium" | "high"; // required energy to complete
  dependencies?: string[]; // IDs of dependent tasks
  aiScore?: number; // AI-calculated priority score
}

export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
  productivityScore: number;
  optimalWorkHours: string[];
  focusQuality: number;
}
