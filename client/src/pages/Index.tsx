
import { useState } from "react";
import { EnhancedTaskManager } from "@/components/EnhancedTaskManager";
import { EnhancedTimeTracker } from "@/components/EnhancedTimeTracker";
import { SmartScheduler } from "@/components/SmartScheduler";
import { Dashboard } from "@/components/Dashboard";
import { FocusModeHub } from "@/components/FocusMode/FocusModeHub";
import { ProductivityDashboard } from "@/components/Analytics/ProductivityDashboard";
import { Navigation } from "@/components/Navigation";
import { Task } from "@/types/Task";
import { TimeSession, TimeBlock } from "@/types/TimeTracking";
import { FocusSession } from "@/types/FocusMode";

const Index = () => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [activeTimeBlock, setActiveTimeBlock] = useState<TimeBlock | null>(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<"week" | "month" | "quarter">("week");

  const handleTasksUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  const handleSessionComplete = (session: TimeSession) => {
    setSessions(prev => [...prev, session]);
  };

  const handleFocusSessionComplete = (session: FocusSession) => {
    setFocusSessions(prev => [...prev, session]);
  };

  const handleStartTimeBlock = (block: TimeBlock) => {
    setActiveTimeBlock(block);
    setActiveTab("timer"); // Auto-switch to timer tab
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-4 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "tasks" && (
            <div className="space-y-4 lg:space-y-6">
              <div className="text-center lg:text-left mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-3xl font-bold text-gray-800 mb-2">
                  Smart Task Management
                </h2>
                <p className="text-sm lg:text-base text-gray-600">AI-powered prioritization and intelligent suggestions</p>
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
                <p className="text-sm lg:text-base text-gray-600">Enhanced time tracking with smart scheduling</p>
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
                    tasks={tasks}
                    onStartTimeBlock={handleStartTimeBlock}
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "focus" && (
            <div className="space-y-4 lg:space-y-6">
              <div className="text-center lg:text-left mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-3xl font-bold text-gray-800 mb-2">
                  AI Focus Mode
                </h2>
                <p className="text-sm lg:text-base text-gray-600">Deep work sessions with intelligent distraction management</p>
              </div>
              <FocusModeHub 
                tasks={tasks}
                onSessionComplete={handleFocusSessionComplete}
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
              <Dashboard />
            </div>
          )}
          
          {activeTab === "analytics" && (
            <div className="space-y-4 lg:space-y-6">
              <div className="text-center lg:text-left mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-3xl font-bold text-gray-800 mb-2">
                  Advanced Analytics
                </h2>
                <p className="text-sm lg:text-base text-gray-600">AI-powered behavioral insights and performance analysis</p>
              </div>
              <ProductivityDashboard 
                timeRange={analyticsTimeRange}
                onTimeRangeChange={setAnalyticsTimeRange}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
