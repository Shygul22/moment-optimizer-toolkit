
import { Task } from "@/types/Task";
import { TimeBlock, TimeSession, ProductivityMetrics } from "@/types/TimeTracking";

export class TimeBlockingAI {
  static generateOptimalSchedule(
    tasks: Task[],
    availableHours: { start: number; end: number }[],
    userMetrics?: ProductivityMetrics[]
  ): TimeBlock[] {
    const schedule: TimeBlock[] = [];
    const peakHours = this.identifyPeakHours(userMetrics);
    const sortedTasks = this.prioritizeTasksForScheduling(tasks);
    
    // Group tasks by energy requirements and type
    const highEnergyTasks = sortedTasks.filter(t => t.energyLevel === 'high');
    const mediumEnergyTasks = sortedTasks.filter(t => t.energyLevel === 'medium');
    const lowEnergyTasks = sortedTasks.filter(t => t.energyLevel === 'low');
    
    // Schedule high-energy tasks during peak hours
    highEnergyTasks.forEach(task => {
      const optimalSlot = this.findOptimalTimeSlot(
        task,
        availableHours,
        peakHours,
        schedule
      );
      if (optimalSlot) {
        schedule.push(this.createTimeBlock(task, optimalSlot, 'deep-work'));
      }
    });
    
    // Schedule medium-energy tasks in remaining good slots
    mediumEnergyTasks.forEach(task => {
      const optimalSlot = this.findOptimalTimeSlot(
        task,
        availableHours,
        [],
        schedule
      );
      if (optimalSlot) {
        const blockType = task.context === 'administrative' ? 'admin' : 'deep-work';
        schedule.push(this.createTimeBlock(task, optimalSlot, blockType));
      }
    });
    
    // Fill remaining slots with low-energy tasks
    lowEnergyTasks.forEach(task => {
      const availableSlot = this.findAvailableTimeSlot(
        task,
        availableHours,
        schedule
      );
      if (availableSlot) {
        schedule.push(this.createTimeBlock(task, availableSlot, 'admin'));
      }
    });
    
    return schedule.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  static identifyPeakHours(metrics?: ProductivityMetrics[]): number[] {
    if (!metrics || metrics.length === 0) {
      // Default peak hours based on research
      return [9, 10, 11, 14, 15];
    }
    
    const hourlyProductivity: { [hour: number]: number[] } = {};
    
    metrics.forEach(metric => {
      metric.peakHours.forEach(hour => {
        if (!hourlyProductivity[hour]) hourlyProductivity[hour] = [];
        hourlyProductivity[hour].push(metric.productivityScore);
      });
    });
    
    // Calculate average productivity for each hour
    const avgProductivity = Object.entries(hourlyProductivity)
      .map(([hour, scores]) => ({
        hour: parseInt(hour),
        avg: scores.reduce((sum, score) => sum + score, 0) / scores.length
      }))
      .sort((a, b) => b.avg - a.avg);
    
    return avgProductivity.slice(0, 5).map(entry => entry.hour);
  }
  
  static prioritizeTasksForScheduling(tasks: Task[]): Task[] {
    return tasks
      .filter(task => !task.completed)
      .sort((a, b) => {
        // Prioritize by AI score first
        if (a.aiScore && b.aiScore) {
          if (a.aiScore !== b.aiScore) return b.aiScore - a.aiScore;
        }
        
        // Then by due date
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        
        // Finally by impact
        return b.impact - a.impact;
      });
  }
  
  static findOptimalTimeSlot(
    task: Task,
    availableHours: { start: number; end: number }[],
    peakHours: number[],
    existingSchedule: TimeBlock[]
  ): { start: Date; end: Date } | null {
    const duration = task.estimatedDuration || 60;
    const today = new Date();
    
    for (const slot of availableHours) {
      for (let hour = slot.start; hour <= slot.end - Math.ceil(duration / 60); hour++) {
        const startTime = new Date(today);
        startTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        
        // Check if this conflicts with existing schedule
        const hasConflict = existingSchedule.some(block =>
          this.timeRangesOverlap(
            { start: startTime, end: endTime },
            { start: block.startTime, end: block.endTime }
          )
        );
        
        if (!hasConflict) {
          // Prefer peak hours for high-energy tasks
          if (task.energyLevel === 'high' && peakHours.includes(hour)) {
            return { start: startTime, end: endTime };
          } else if (task.energyLevel !== 'high') {
            return { start: startTime, end: endTime };
          }
        }
      }
    }
    
    return null;
  }
  
  static findAvailableTimeSlot(
    task: Task,
    availableHours: { start: number; end: number }[],
    existingSchedule: TimeBlock[]
  ): { start: Date; end: Date } | null {
    const duration = task.estimatedDuration || 30;
    const today = new Date();
    
    for (const slot of availableHours) {
      for (let hour = slot.start; hour <= slot.end - Math.ceil(duration / 60); hour++) {
        const startTime = new Date(today);
        startTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        
        const hasConflict = existingSchedule.some(block =>
          this.timeRangesOverlap(
            { start: startTime, end: endTime },
            { start: block.startTime, end: block.endTime }
          )
        );
        
        if (!hasConflict) {
          return { start: startTime, end: endTime };
        }
      }
    }
    
    return null;
  }
  
  static createTimeBlock(
    task: Task,
    timeSlot: { start: Date; end: Date },
    blockType: TimeBlock['blockType']
  ): TimeBlock {
    return {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: task.title,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      taskIds: [task.id],
      blockType,
      energyRequired: task.energyLevel,
      flexibility: 'flexible',
      aiGenerated: true
    };
  }
  
  static timeRangesOverlap(
    range1: { start: Date; end: Date },
    range2: { start: Date; end: Date }
  ): boolean {
    return range1.start < range2.end && range1.end > range2.start;
  }
  
  static calculateOptimalBreaks(
    schedule: TimeBlock[],
    workSession: number = 90 // minutes
  ): TimeBlock[] {
    const breaks: TimeBlock[] = [];
    
    for (let i = 0; i < schedule.length - 1; i++) {
      const currentBlock = schedule[i];
      const nextBlock = schedule[i + 1];
      
      const sessionDuration = (currentBlock.endTime.getTime() - currentBlock.startTime.getTime()) / 60000;
      
      if (sessionDuration >= workSession) {
        const breakStart = new Date(currentBlock.endTime);
        const breakDuration = sessionDuration > 120 ? 15 : 5; // Longer breaks for longer sessions
        const breakEnd = new Date(breakStart.getTime() + breakDuration * 60000);
        
        if (breakEnd <= nextBlock.startTime) {
          breaks.push({
            id: `break-${Date.now()}-${i}`,
            title: "Break",
            startTime: breakStart,
            endTime: breakEnd,
            taskIds: [],
            blockType: 'break',
            energyRequired: 'low',
            flexibility: 'flexible',
            aiGenerated: true
          });
        }
      }
    }
    
    return breaks;
  }
}
