import { useState } from "react";
import { EnhancedTaskManager } from "@/components/EnhancedTaskManager";
import { EnhancedTimeTracker } from "@/components/EnhancedTimeTracker";
import { SmartScheduler } from "@/components/SmartScheduler";
import { ResponsiveDashboard } from "@/components/ResponsiveDashboard";
import { SimpleNotifications } from "@/components/SimpleNotifications";
import { Navigation } from "@/components/Navigation";
import { TaskPrioritization } from "@/components/TaskPrioritization";
import { Task, TimeSession } from "@shared/schema";
import { TimeBlock } from "@/types/TimeTracking";

const Index = () => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [activeTimeBlock, setActiveTimeBlock] = useState<TimeBlock | null>(null);

  const handleTasksUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  const handleSessionComplete = (session: TimeSession) => {
    setSessions(prev => [...prev, session]);
  };

  const handleStartTimeBlock = (block: TimeBlock) => {
    setActiveTimeBlock(block);
    setActiveTab("timer"); // Auto-switch to timer tab
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <SimpleNotifications 
          tasks={tasks}
        />
      </div>
      
      <main className="container mx-auto px-4 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "tasks" && (
            <div className="space-y-4 lg:space-y-6">
              <div className="text-center lg:text-left mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-3xl font-bold text-gray-800 mb-2">
                  Task Management
                </h2>
                <p className="text-sm lg:text-base text-gray-600">Organize and prioritize your tasks effectively</p>
              </div>
              <EnhancedTaskManager 
                onTasksUpdate={handleTasksUpdate}
              />
            </div>
          )}
          
          {activeTab === "timer" && (
            <div className="space-y-4 lg:space-y-8">
              <div className="text-center lg:text-left mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-3xl font-bold text-gray-800 mb-2">
                  Time Tracking & Scheduling
                </h2>
                <p className="text-sm lg:text-base text-gray-600">Track your time and schedule your work effectively</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
                <div className="lg:col-span-3">
                  <EnhancedTimeTracker 
                    activeTimeBlock={activeTimeBlock}
                    onSessionComplete={handleSessionComplete}
                  />
                </div>
                <div className="lg:col-span-2">
                  <SmartScheduler 
                    tasks={tasks as any[]}
                    onStartTimeBlock={handleStartTimeBlock}
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "prioritize" && (
            <div className="space-y-4 lg:space-y-6">
              <div className="text-center lg:text-left mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-3xl font-bold text-gray-800 mb-2">
                  Smart Task Prioritization
                </h2>
                <p className="text-sm lg:text-base text-gray-600">AI-powered prioritization using proven methodologies</p>
              </div>
              <TaskPrioritization 
                tasks={tasks as any[]}
                onTaskPriorityUpdate={(taskId: number, newPriority: string) => {
                  // Handle priority updates here
                }}
                onTaskReorder={(reorderedTasks: any[]) => {
                  setTasks(reorderedTasks as Task[]);
                }}
              />
            </div>
          )}
          
          {activeTab === "dashboard" && (
            <div className="space-y-4 lg:space-y-6">
              <div className="text-center lg:text-left mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-3xl font-bold text-gray-800 mb-2">
                  Productivity Dashboard
                </h2>
                <p className="text-sm lg:text-base text-gray-600">Overview of your productivity metrics and trends</p>
              </div>
              <ResponsiveDashboard />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;