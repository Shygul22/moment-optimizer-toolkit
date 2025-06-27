import { Task } from '../types/Task';
import { addDays, isToday, isTomorrow, differenceInDays } from 'date-fns';

export interface PrioritizationResult {
  taskId: number;
  originalPriority: string;
  calculatedPriority: string;
  score: number;
  reasoning: string;
  methodology: 'eisenhower' | 'eat-the-frog' | '80-20-rule' | 'composite';
  quadrant?: string; // For Eisenhower Matrix
  category?: string; // For other methods
}

// Eisenhower Matrix Implementation
export function applyEisenhowerMatrix(tasks: Task[]): PrioritizationResult[] {
  return tasks.map(task => {
    const urgency = calculateUrgency(task);
    const importance = calculateImportance(task);
    
    let quadrant: string;
    let calculatedPriority: string;
    let reasoning: string;
    
    if (importance >= 7 && urgency >= 7) {
      quadrant = "Q1: Do First (Urgent & Important)";
      calculatedPriority = "urgent";
      reasoning = "Critical task requiring immediate attention";
    } else if (importance >= 7 && urgency < 7) {
      quadrant = "Q2: Schedule (Important, Not Urgent)";
      calculatedPriority = "high";
      reasoning = "Important task to plan and execute strategically";
    } else if (importance < 7 && urgency >= 7) {
      quadrant = "Q3: Delegate (Urgent, Not Important)";
      calculatedPriority = "medium";
      reasoning = "Urgent but consider delegating or minimizing time spent";
    } else {
      quadrant = "Q4: Eliminate (Neither Urgent nor Important)";
      calculatedPriority = "low";
      reasoning = "Consider eliminating or doing when time permits";
    }
    
    const score = (importance * 0.6) + (urgency * 0.4);
    
    return {
      taskId: task.id,
      originalPriority: task.priority,
      calculatedPriority,
      score,
      reasoning,
      methodology: 'eisenhower' as const,
      quadrant,
    };
  });
}

// Eat the Frog Implementation
export function applyEatTheFrog(tasks: Task[]): PrioritizationResult[] {
  const taskDifficulty = tasks.map(task => ({
    ...task,
    difficultyScore: calculateTaskDifficulty(task)
  }));
  
  // Sort by difficulty (hardest first)
  taskDifficulty.sort((a, b) => b.difficultyScore - a.difficultyScore);
  
  return taskDifficulty.map((task, index) => {
    let category: string;
    let calculatedPriority: string;
    let reasoning: string;
    
    if (index === 0) {
      category = "The Frog - Hardest Task";
      calculatedPriority = "urgent";
      reasoning = "Most challenging task - tackle first when energy is highest";
    } else if (index <= 2) {
      category = "Major Tasks";
      calculatedPriority = "high";
      reasoning = "Significant tasks to complete after the main frog";
    } else if (index <= 5) {
      category = "Medium Tasks";
      calculatedPriority = "medium";
      reasoning = "Moderate tasks for mid-day execution";
    } else {
      category = "Quick Wins";
      calculatedPriority = "low";
      reasoning = "Simple tasks for when energy is lower";
    }
    
    return {
      taskId: task.id,
      originalPriority: task.priority,
      calculatedPriority,
      score: 10 - index, // Higher score for harder tasks
      reasoning,
      methodology: 'eat-the-frog' as const,
      category,
    };
  });
}

// 80/20 Rule (Pareto Principle) Implementation
export function apply80_20Rule(tasks: Task[]): PrioritizationResult[] {
  const tasksWithImpact = tasks.map(task => ({
    ...task,
    impactScore: calculateTaskImpact(task)
  }));
  
  // Sort by impact (highest first)
  tasksWithImpact.sort((a, b) => b.impactScore - a.impactScore);
  
  const totalTasks = tasks.length;
  const top20Percent = Math.ceil(totalTasks * 0.2);
  const next30Percent = Math.ceil(totalTasks * 0.5);
  
  return tasksWithImpact.map((task, index) => {
    let category: string;
    let calculatedPriority: string;
    let reasoning: string;
    
    if (index < top20Percent) {
      category = "Vital Few (20% - High Impact)";
      calculatedPriority = "urgent";
      reasoning = "High-impact task that drives 80% of results";
    } else if (index < next30Percent) {
      category = "Important Many (30% - Medium Impact)";
      calculatedPriority = "high";
      reasoning = "Moderate impact task worth significant attention";
    } else {
      category = "Trivial Many (50% - Low Impact)";
      calculatedPriority = task.impactScore > 5 ? "medium" : "low";
      reasoning = "Lower impact task - minimize time or delegate";
    }
    
    return {
      taskId: task.id,
      originalPriority: task.priority,
      calculatedPriority,
      score: task.impactScore,
      reasoning,
      methodology: '80-20-rule' as const,
      category,
    };
  });
}

// Helper function to calculate urgency (1-10 scale)
function calculateUrgency(task: Task): number {
  if (!task.dueDate) return 3; // No due date = low urgency
  
  const daysUntilDue = differenceInDays(new Date(task.dueDate), new Date());
  
  if (daysUntilDue < 0) return 10; // Overdue
  if (daysUntilDue === 0) return 9; // Due today
  if (daysUntilDue === 1) return 8; // Due tomorrow
  if (daysUntilDue <= 3) return 7; // Due within 3 days
  if (daysUntilDue <= 7) return 5; // Due within a week
  if (daysUntilDue <= 14) return 3; // Due within 2 weeks
  return 2; // Due later
}

// Helper function to calculate importance (1-10 scale)
function calculateImportance(task: Task): number {
  let score = 5; // Base score
  
  // Priority mapping
  switch (task.priority) {
    case 'urgent': score += 4; break;
    case 'high': score += 3; break;
    case 'medium': score += 1; break;
    case 'low': score -= 1; break;
  }
  
  // Additional factors
  if (task.complexity === 'high') score += 2;
  if (task.impact === 'high') score += 2;
  if (task.energyLevel === 'high') score += 1;
  
  // Ensure score is within 1-10 range
  return Math.max(1, Math.min(10, score));
}

// Helper function to calculate task difficulty (1-10 scale)
function calculateTaskDifficulty(task: Task): number {
  let score = 5; // Base score
  
  // Complexity factor
  switch (task.complexity) {
    case 'high': score += 3; break;
    case 'medium': score += 1; break;
    case 'low': score -= 1; break;
  }
  
  // Energy requirement factor
  switch (task.energyLevel) {
    case 'high': score += 2; break;
    case 'medium': score += 1; break;
    case 'low': score -= 1; break;
  }
  
  // Time estimation factor (longer tasks are often harder)
  if (task.estimatedTime) {
    const hours = task.estimatedTime / 60;
    if (hours > 4) score += 2;
    else if (hours > 2) score += 1;
    else if (hours < 0.5) score -= 1;
  }
  
  return Math.max(1, Math.min(10, score));
}

// Helper function to calculate task impact (1-10 scale)
function calculateTaskImpact(task: Task): number {
  let score = 5; // Base score
  
  // Impact mapping
  switch (task.impact) {
    case 'high': score += 3; break;
    case 'medium': score += 1; break;
    case 'low': score -= 1; break;
  }
  
  // Priority influence
  switch (task.priority) {
    case 'urgent': score += 2; break;
    case 'high': score += 1; break;
    case 'low': score -= 1; break;
  }
  
  // Complexity can indicate impact
  if (task.complexity === 'high') score += 1;
  
  // Due date urgency affects impact
  if (task.dueDate) {
    const daysUntilDue = differenceInDays(new Date(task.dueDate), new Date());
    if (daysUntilDue <= 1) score += 1;
  }
  
  return Math.max(1, Math.min(10, score));
}

// Composite prioritization that combines all methods
export function getCompositeprioritization(tasks: Task[]): {
  results: { [methodology: string]: PrioritizationResult[] };
  recommendations: PrioritizationResult[];
} {
  const eisenhowerResults = applyEisenhowerMatrix(tasks);
  const eatFrogResults = applyEatTheFrog(tasks);
  const paretoResults = apply80_20Rule(tasks);
  
  // Combine scores with weights
  const composite = tasks.map(task => {
    const eisenScore = eisenhowerResults.find(r => r.taskId === task.id)?.score || 0;
    const frogScore = eatFrogResults.find(r => r.taskId === task.id)?.score || 0;
    const paretoScore = paretoResults.find(r => r.taskId === task.id)?.score || 0;
    
    // Weight: Eisenhower (40%), Eat the Frog (30%), Pareto (30%)
    const compositeScore = (eisenScore * 0.4) + (frogScore * 0.3) + (paretoScore * 0.3);
    
    let finalPriority: string;
    if (compositeScore >= 8) finalPriority = 'urgent';
    else if (compositeScore >= 6) finalPriority = 'high';
    else if (compositeScore >= 4) finalPriority = 'medium';
    else finalPriority = 'low';
    
    return {
      taskId: task.id,
      originalPriority: task.priority,
      calculatedPriority: finalPriority,
      score: compositeScore,
      reasoning: "Combined analysis from all three methodologies",
      methodology: 'composite' as any,
    };
  });
  
  // Sort by composite score
  composite.sort((a, b) => b.score - a.score);
  
  return {
    results: {
      eisenhower: eisenhowerResults,
      'eat-the-frog': eatFrogResults,
      '80-20-rule': paretoResults,
    },
    recommendations: composite,
  };
}