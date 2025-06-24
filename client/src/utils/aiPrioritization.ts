
import { Task } from "@/types/Task";

export class AITaskPrioritizer {
  static calculatePriorityScore(task: Task, currentTime: Date = new Date()): number {
    let score = 0;
    
    // Base priority weight (30%)
    const priorityWeights = { high: 10, medium: 6, low: 3 };
    score += priorityWeights[task.priority] * 0.3;
    
    // Impact weight (25%)
    score += task.impact * 2 * 0.25;
    
    // Urgency based on due date (20%)
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((task.dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) score += 10 * 0.2;
      else if (daysUntilDue <= 3) score += 7 * 0.2;
      else if (daysUntilDue <= 7) score += 4 * 0.2;
      else score += 2 * 0.2;
    }
    
    // Complexity consideration (15%) - simpler tasks get slight priority
    score += (6 - task.complexity) * 0.15;
    
    // Context and energy optimization (10%)
    const currentHour = currentTime.getHours();
    if (this.isOptimalTimeForContext(task.context, currentHour)) {
      score += 5 * 0.1;
    }
    
    return Math.round(score * 10) / 10;
  }
  
  static isOptimalTimeForContext(context: Task['context'], hour: number): boolean {
    const optimalTimes = {
      work: [9, 10, 11, 14, 15, 16],
      creative: [8, 9, 10, 20, 21],
      administrative: [13, 14, 15, 16, 17],
      learning: [8, 9, 10, 19, 20],
      personal: [17, 18, 19, 20, 21]
    };
    
    return optimalTimes[context].includes(hour);
  }
  
  static getSmartSuggestions(tasks: Task[], currentTime: Date = new Date()): Task[] {
    const currentHour = currentTime.getHours();
    const availableTasks = tasks.filter(task => !task.completed);
    
    // Calculate AI scores for all tasks
    const scoredTasks = availableTasks.map(task => ({
      ...task,
      aiScore: this.calculatePriorityScore(task, currentTime)
    }));
    
    // Sort by AI score and return top suggestions
    return scoredTasks
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, 3);
  }
  
  static getEnergyRecommendation(currentHour: number): 'low' | 'medium' | 'high' {
    if (currentHour >= 8 && currentHour <= 11) return 'high';
    if (currentHour >= 14 && currentHour <= 16) return 'medium';
    return 'low';
  }
}
