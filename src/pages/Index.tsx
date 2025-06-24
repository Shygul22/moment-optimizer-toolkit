
import { useState } from "react";
import { TaskManager } from "@/components/TaskManager";
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
            Time<span className="text-indigo-600">Flow</span>
          </h1>
          <p className="text-gray-600">Master your time, achieve your goals</p>
        </header>
        
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="mt-8">
          {activeTab === "tasks" && <TaskManager />}
          {activeTab === "timer" && <TimeTracker />}
          {activeTab === "dashboard" && <Dashboard />}
        </main>
      </div>
    </div>
  );
};

export default Index;
