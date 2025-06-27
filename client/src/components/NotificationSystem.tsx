import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertTriangle, Target, Coffee, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Notification, NotificationPreferences, Reminder } from '../types/Notifications';
import { Task } from '../types/Task';

interface NotificationSystemProps {
  tasks: Task[];
  currentScheduleBlock?: any;
}

export const NotificationSystem = ({ tasks, currentScheduleBlock }: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: '1',
    enableBrowserNotifications: true,
    enableSoundAlerts: true,
    enableTaskReminders: true,
    enableScheduleAlerts: true,
    enablePriorityAlerts: true,
    reminderAdvanceTime: 15,
    weekendNotifications: true,
    priorityThreshold: 'medium',
  });

  // Request browser notification permission
  useEffect(() => {
    if (preferences.enableBrowserNotifications && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [preferences.enableBrowserNotifications]);

  // Monitor tasks for due date reminders
  useEffect(() => {
    const checkTaskReminders = () => {
      const now = new Date();
      const advanceTimeMs = preferences.reminderAdvanceTime * 60 * 1000;

      tasks.forEach(task => {
        if (!task.dueDate || task.completed) return;

        const dueDate = new Date(task.dueDate);
        const reminderTime = new Date(dueDate.getTime() - advanceTimeMs);

        if (now >= reminderTime && now < dueDate) {
          const existingReminder = notifications.find(
            n => n.taskId === task.id && n.type === 'reminder'
          );

          if (!existingReminder) {
            createNotification({
              type: 'reminder',
              title: 'Task Due Soon',
              message: `"${task.title}" is due in ${preferences.reminderAdvanceTime} minutes`,
              priority: task.priority as any,
              taskId: task.id,
            });
          }
        }
      });
    };

    const interval = setInterval(checkTaskReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, preferences.reminderAdvanceTime, notifications]);

  // Monitor schedule blocks for time reminders
  useEffect(() => {
    if (!currentScheduleBlock) return;

    const checkScheduleReminder = () => {
      const now = new Date();
      const blockStart = new Date(currentScheduleBlock.startTime);
      const fiveMinutesBefore = new Date(blockStart.getTime() - 5 * 60 * 1000);

      if (now >= fiveMinutesBefore && now < blockStart) {
        const existingReminder = notifications.find(
          n => n.scheduleBlockId === currentScheduleBlock.id && n.type === 'schedule'
        );

        if (!existingReminder) {
          createNotification({
            type: 'schedule',
            title: 'Schedule Block Starting',
            message: `"${currentScheduleBlock.title}" starts in 5 minutes`,
            priority: 'medium',
            scheduleBlockId: currentScheduleBlock.id,
          });
        }
      }
    };

    const interval = setInterval(checkScheduleReminder, 60000);
    return () => clearInterval(interval);
  }, [currentScheduleBlock, notifications]);

  const createNotification = (notificationData: Partial<Notification>) => {
    const notification: Notification = {
      id: `notification-${Date.now()}-${Math.random()}`,
      type: notificationData.type || 'reminder',
      title: notificationData.title || 'Reminder',
      message: notificationData.message || '',
      priority: notificationData.priority || 'medium',
      taskId: notificationData.taskId,
      scheduleBlockId: notificationData.scheduleBlockId,
      triggerTime: new Date(),
      isRead: false,
      isActive: true,
      createdAt: new Date(),
      userId: preferences.userId,
    };

    setNotifications(prev => [notification, ...prev]);

    // Show browser notification
    if (preferences.enableBrowserNotifications && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
      });
    }

    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      action: {
        label: 'View',
        onClick: () => setIsOpen(true),
      },
    });

    // Play sound alert
    if (preferences.enableSoundAlerts) {
      // You can add sound file later
      // new Audio('/notification.mp3').play();
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'schedule': return Calendar;
      case 'priority': return AlertTriangle;
      case 'focus': return Target;
      case 'break': return Coffee;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 px-1 min-w-[20px] h-5 text-xs bg-red-500 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 z-50">
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Notification Settings */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Browser Notifications</span>
                    <Switch
                      checked={preferences.enableBrowserNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, enableBrowserNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Task Reminders</span>
                    <Switch
                      checked={preferences.enableTaskReminders}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, enableTaskReminders: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Schedule Alerts</span>
                    <Switch
                      checked={preferences.enableScheduleAlerts}
                      onCheckedChange={(checked) =>
                        setPreferences(prev => ({ ...prev, enableScheduleAlerts: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !notification.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium text-sm ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => dismissNotification(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                  {notification.triggerTime.toLocaleTimeString()}
                                </span>
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs h-6 px-2"
                                  >
                                    Mark read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Quick Actions */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    }}
                    className="flex-1"
                  >
                    Mark All Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNotifications([])}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};