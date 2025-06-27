export interface Notification {
  id: string;
  type: 'reminder' | 'schedule' | 'priority' | 'focus' | 'break';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  taskId?: number;
  scheduleBlockId?: string;
  triggerTime: Date;
  isRead: boolean;
  isActive: boolean;
  createdAt: Date;
  userId: string;
}

export interface Reminder {
  id: string;
  taskId: number;
  type: 'due-date' | 'start-time' | 'custom' | 'priority-change';
  reminderTime: Date;
  message: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: Date;
  userId: string;
}

export interface NotificationPreferences {
  userId: string;
  enableBrowserNotifications: boolean;
  enableSoundAlerts: boolean;
  enableTaskReminders: boolean;
  enableScheduleAlerts: boolean;
  enablePriorityAlerts: boolean;
  reminderAdvanceTime: number; // minutes before due date
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
  weekendNotifications: boolean;
  priorityThreshold: 'low' | 'medium' | 'high'; // minimum priority to show notifications
}

export interface NotificationRule {
  id: string;
  name: string;
  condition: string; // JSON string representing the condition
  action: 'notify' | 'remind' | 'prioritize';
  message: string;
  isActive: boolean;
  userId: string;
}