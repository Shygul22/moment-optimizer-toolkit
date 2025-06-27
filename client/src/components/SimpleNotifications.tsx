import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { toast } from 'sonner';

interface SimpleNotificationsProps {
  tasks: any[];
}

interface SimpleNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'priority' | 'overdue';
  taskId?: number;
  timestamp: Date;
  read: boolean;
}

export const SimpleNotifications = ({ tasks }: SimpleNotificationsProps) => {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enableReminders: true,
    enablePriorityAlerts: true,
    reminderMinutes: 15,
  });

  // Check for overdue and upcoming tasks
  useEffect(() => {
    if (!settings.enableReminders) return;

    const checkTasks = () => {
      const now = new Date();
      const newNotifications: SimpleNotification[] = [];

      tasks.forEach(task => {
        if (task.completed || !task.dueDate) return;

        const dueDate = new Date(task.dueDate);
        const minutesUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60);

        // Overdue tasks
        if (minutesUntilDue < 0) {
          const existing = notifications.find(n => n.taskId === task.id && n.type === 'overdue');
          if (!existing) {
            newNotifications.push({
              id: `overdue-${task.id}-${Date.now()}`,
              title: 'Task Overdue',
              message: `"${task.title}" is overdue`,
              type: 'overdue',
              taskId: task.id,
              timestamp: new Date(),
              read: false,
            });
          }
        }
        // Upcoming due date reminders
        else if (minutesUntilDue <= settings.reminderMinutes && minutesUntilDue > 0) {
          const existing = notifications.find(n => n.taskId === task.id && n.type === 'reminder');
          if (!existing) {
            newNotifications.push({
              id: `reminder-${task.id}-${Date.now()}`,
              title: 'Task Due Soon',
              message: `"${task.title}" is due in ${Math.round(minutesUntilDue)} minutes`,
              type: 'reminder',
              taskId: task.id,
              timestamp: new Date(),
              read: false,
            });
          }
        }

        // High priority task alerts
        if (settings.enablePriorityAlerts && task.priority === 'high' && minutesUntilDue > 0 && minutesUntilDue <= 60) {
          const existing = notifications.find(n => n.taskId === task.id && n.type === 'priority');
          if (!existing) {
            newNotifications.push({
              id: `priority-${task.id}-${Date.now()}`,
              title: 'High Priority Task',
              message: `High priority task "${task.title}" due soon`,
              type: 'priority',
              taskId: task.id,
              timestamp: new Date(),
              read: false,
            });
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        
        // Show toast for new notifications
        newNotifications.forEach(notification => {
          toast(notification.title, {
            description: notification.message,
            action: {
              label: 'View',
              onClick: () => setIsOpen(true),
            },
          });
        });

        // Request browser notification permission and show notifications
        if (Notification.permission === 'granted') {
          newNotifications.forEach(notification => {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
            });
          });
        } else if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    };

    const interval = setInterval(checkTasks, 60000); // Check every minute
    checkTasks(); // Initial check

    return () => clearInterval(interval);
  }, [tasks, settings, notifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'priority': return AlertTriangle;
      case 'overdue': return AlertTriangle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'priority': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'reminder': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
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
        <div className="absolute right-0 top-12 w-80 z-50">
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
              {/* Settings */}
              <div className="p-4 bg-gray-50 border-b space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Task Reminders</span>
                  <Switch
                    checked={settings.enableReminders}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, enableReminders: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Priority Alerts</span>
                  <Switch
                    checked={settings.enablePriorityAlerts}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, enablePriorityAlerts: checked }))
                    }
                  />
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-64">
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
                          className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium text-sm ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
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
                                  {notification.timestamp.toLocaleTimeString()}
                                </span>
                                {!notification.read && (
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
              {notifications.length > 0 && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};