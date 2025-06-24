
import { Clock, CheckSquare, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const tabs = [
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "timer", label: "Timer", icon: Clock },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  ];

  return (
    <nav className="flex justify-center">
      <div className="bg-white rounded-lg p-1 shadow-lg border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};
