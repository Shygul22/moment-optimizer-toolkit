import { useEffect, useState } from 'react';
import { ref, push, set, remove, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useFirebaseAuth } from './use-firebase-auth';
import type { Task, TimeSession, CoachingBooking } from '@shared/schema';

export const useFirebaseData = () => {
  const { user } = useFirebaseAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeSessions, setTimeSessions] = useState<TimeSession[]>([]);
  const [bookings, setBookings] = useState<CoachingBooking[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time tasks subscription
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    setLoading(true);
    const tasksRef = ref(database, `users/${user.uid}/tasks`);
    
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksList = Object.entries(data).map(([id, task]: [string, any]) => ({
          ...task,
          id: parseInt(id),
          createdAt: task.createdAt ? new Date(task.createdAt) : null,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
        }));
        setTasks(tasksList);
      } else {
        setTasks([]);
      }
      setLoading(false);
    });

    return () => off(tasksRef, 'value', unsubscribe);
  }, [user]);

  // Real-time time sessions subscription
  useEffect(() => {
    if (!user) {
      setTimeSessions([]);
      return;
    }

    const sessionsRef = ref(database, `users/${user.uid}/timeSessions`);
    
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sessionsList = Object.entries(data).map(([id, session]: [string, any]) => ({
          ...session,
          id: parseInt(id),
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : null,
        }));
        setTimeSessions(sessionsList);
      } else {
        setTimeSessions([]);
      }
    });

    return () => off(sessionsRef, 'value', unsubscribe);
  }, [user]);

  // Tasks operations
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const tasksRef = ref(database, `users/${user.uid}/tasks`);
    const newTaskRef = push(tasksRef);
    
    const task = {
      ...taskData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    
    await set(newTaskRef, task);
    return { ...task, id: parseInt(newTaskRef.key || '0') };
  };

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');
    
    const taskRef = ref(database, `users/${user.uid}/tasks/${taskId}`);
    await set(taskRef, { ...updates });
  };

  const deleteTask = async (taskId: number) => {
    if (!user) throw new Error('User not authenticated');
    
    const taskRef = ref(database, `users/${user.uid}/tasks/${taskId}`);
    await remove(taskRef);
  };

  // Time sessions operations
  const createTimeSession = async (sessionData: Omit<TimeSession, 'id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const sessionsRef = ref(database, `users/${user.uid}/timeSessions`);
    const newSessionRef = push(sessionsRef);
    
    const session = {
      ...sessionData,
      userId: user.uid,
      startTime: sessionData.startTime.toISOString(),
      endTime: sessionData.endTime?.toISOString() || null,
    };
    
    await set(newSessionRef, session);
    return { ...sessionData, id: parseInt(newSessionRef.key || '0') };
  };

  const updateTimeSession = async (sessionId: number, updates: Partial<TimeSession>) => {
    if (!user) throw new Error('User not authenticated');
    
    const sessionRef = ref(database, `users/${user.uid}/timeSessions/${sessionId}`);
    const updateData = {
      ...updates,
      startTime: updates.startTime?.toISOString(),
      endTime: updates.endTime?.toISOString() || null,
    };
    await set(sessionRef, updateData);
  };

  // Dashboard stats (calculated from real-time data)
  const getDashboardStats = () => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTimeTracked = timeSessions.reduce((total, session) => total + (session.duration || 0), 0);
    const avgFocusQuality = timeSessions.length > 0 
      ? timeSessions.reduce((sum, session) => sum + (session.focusQuality || 0), 0) / timeSessions.length
      : 0;

    return {
      tasksCompleted: completedTasks,
      timeTracked: totalTimeTracked,
      focusScore: Math.round(avgFocusQuality * 20), // Convert to 0-100 scale
      streakDays: 3, // Simplified calculation
      currentSessionTime: 0,
    };
  };

  return {
    tasks,
    timeSessions,
    bookings,
    loading,
    createTask,
    updateTask,
    deleteTask,
    createTimeSession,
    updateTimeSession,
    getDashboardStats,
  };
};