
import { useState } from "react";
import { EnhancedTaskManager } from "@/components/EnhancedTaskManager";
import { TimeTracker } from "@/components/TimeTracker";
import { Dashboard } from "@/components/Dashboard";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  const [activeTab, setActiveTab] = useState("tasks");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI
            </span>
            Time<span className="text-indigo-600">Flow</span>
          </h1>
          <p className="text-gray-600">Transform your chaos into focused productivity with AI-powered insights</p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-indigo-600">
            <span className="bg-indigo-100 px-3 py-1 rounded-full">Smart Prioritization</span>
            <span className="bg-purple-100 px-3 py-1 rounded-full">Time Blocking</span>
            <span className="bg-blue-100 px-3 py-1 rounded-full">Focus Mode</span>
          </div>
        </header>
        
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="mt-8">
          {activeTab === "tasks" && <EnhancedTaskManager />}
          {activeTab === "timer" && <TimeTracker />}
          {activeTab === "dashboard" && <Dashboard />}
        </main>
      </div>
    </div>
  );
};

export default Index;
