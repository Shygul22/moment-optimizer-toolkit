
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  CheckSquare, 
  Timer, 
  BarChart3, 
  Target,
  Menu
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const tabs = [
    { id: "tasks", label: "Tasks", icon: CheckSquare, color: "text-blue-600", description: "Task management" },
    { id: "timer", label: "Timer", icon: Timer, color: "text-green-600", description: "Time tracking" },
    { id: "prioritize", label: "Prioritize", icon: Target, color: "text-purple-600", description: "AI task prioritization" },
    { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "text-indigo-600", description: "Productivity overview" },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  <span className="text-indigo-600">TimeFlow</span>
                </h1>
                <p className="text-xs text-gray-500">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-80 sm:max-w-sm">
                <DialogTitle>Navigation</DialogTitle>
                <DialogDescription>
                  Navigate between different sections of the app
                </DialogDescription>
                <div className="flex flex-col h-full">
                  <div className="pb-4 border-b">
                    <h2 className="text-lg font-semibold">Navigation</h2>
                  </div>
                  
                  <nav className="flex-1 pt-6">
                    <div className="space-y-2">
                      {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                          <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? "default" : "ghost"}
                            className={`w-full justify-start h-auto p-4 ${
                              activeTab === tab.id 
                                ? "bg-indigo-100 text-indigo-700" 
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleTabClick(tab.id)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <IconComponent className={`h-5 w-5 mt-0.5 ${activeTab === tab.id ? "text-indigo-600" : tab.color}`} />
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{tab.label}</span>
                                  {tab.badge && <Badge variant="outline" className="text-xs">{tab.badge}</Badge>}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{tab.description}</p>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </nav>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Mobile Tab Indicator */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return tab.id === activeTab ? (
                <div key={tab.id} className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                </div>
              ) : null;
            })}
          </div>
        </div>
      </>
    );
  }

  // Desktop Navigation
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                <span className="text-indigo-600">TimeFlow</span>
              </h1>
              <p className="text-sm text-gray-500">Minimalist productivity platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex bg-white rounded-xl shadow-lg p-2 space-x-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id 
                      ? "bg-indigo-100 text-indigo-700 shadow-sm" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComponent className={`h-4 w-4 ${activeTab === tab.id ? "text-indigo-600" : tab.color}`} />
                  <span className="font-medium hidden md:inline text-sm lg:text-base">{tab.label}</span>
                  {tab.badge && <Badge variant="outline" className="ml-1 text-xs hidden lg:inline">{tab.badge}</Badge>}
                </Button>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden xl:flex text-xs">
              {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
