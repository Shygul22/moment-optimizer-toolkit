import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Timer, Shield, Target, BarChart3 } from "lucide-react";
import { AdaptivePomodoro } from "./AdaptivePomodoro";
import { DistractionManager } from "./DistractionManager";
import { IntelligentFocusSession } from "./IntelligentFocusSession";
import { Task } from "@/types/Task";
import { FocusSession, Distraction } from "@/types/FocusMode";

interface FocusModeHubProps {
  tasks: Task[];
  onSessionComplete: (session: FocusSession) => void;
}

export const FocusModeHub = ({ tasks, onSessionComplete }: FocusModeHubProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [activeSessions, setActiveSessions] = useState<FocusSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const handleSessionComplete = (session: FocusSession) => {
    setActiveSessions(prev => [...prev, session]);
    onSessionComplete(session);
    
    if (session.id === activeSessionId) {
      setActiveSessionId(null);
    }
  };

  const handleSessionUpdate = (session: Partial<FocusSession>) => {
    if (session.id) {
      setActiveSessionId(session.id);
    }
  };

  const handleDistractionLogged = (distraction: Distraction) => {
    // Update active session with distraction
    if (activeSessionId) {
      setActiveSessions(prev => 
        prev.map(s => 
          s.id === activeSessionId 
            ? { ...s, distractions: [...s.distractions, distraction] }
            : s
        )
      );
    }
  };

  const isSessionActive = activeSessionId !== null;

  const getTaskRecommendations = () => {
    if (tasks.length === 0) return [];

    // AI-powered task recommendations based on current context
    const currentHour = new Date().getHours();
    const recommendations = tasks
      .filter(task => !task.completed)
      .map(task => {
        let score = 0;
        const reasons = [];

        // Time-based scoring
        if (currentHour >= 9 && currentHour <= 11) {
          // Morning peak hours
          if (task.complexity >= 4) {
            score += 20;
            reasons.push("Complex tasks work best in morning peak hours");
          }
          if (task.energyLevel === "high") {
            score += 15;
            reasons.push("High energy tasks align with morning alertness");
          }
        } else if (currentHour >= 14 && currentHour <= 16) {
          // Afternoon productivity window
          if (task.context === "administrative") {
            score += 15;
            reasons.push("Administrative tasks fit afternoon focus");
          }
          if (task.complexity <= 3) {
            score += 10;
            reasons.push("Moderate complexity suits afternoon energy");
          }
        }

        // Energy level matching
        const energyMatch = {
          "low": [1, 2],
          "medium": [2, 3, 4],
          "high": [4, 5]
        };

        if (energyMatch[task.energyLevel]?.includes(energyLevel)) {
          score += 25;
          reasons.push("Energy requirement matches your current level");
        }

        // Priority and impact scoring
        score += task.priority === "high" ? 15 : task.priority === "medium" ? 10 : 5;
        score += task.impact * 5;

        // Due date urgency
        if (task.dueDate) {
          const daysUntilDue = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue <= 1) {
            score += 30;
            reasons.push("Due very soon - high urgency");
          } else if (daysUntilDue <= 3) {
            score += 20;
            reasons.push("Due soon - moderate urgency");
          }
        }

        return {
          task,
          score,
          reasons
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return recommendations;
  };

  const taskRecommendations = getTaskRecommendations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI-Powered Focus Mode
            {isSessionActive && (
              <Badge variant="default" className="animate-pulse">
                Session Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Task Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Task (Optional)</label>
              <Select value={selectedTask?.id || ""} onValueChange={(taskId) => {
                const task = tasks.find(t => t.id === taskId);
                setSelectedTask(task);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a task to focus on" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.filter(t => !t.completed).map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Energy Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Energy Level</label>
              <Select value={energyLevel.toString()} onValueChange={(value) => {
                setEnergyLevel(parseInt(value) as 1 | 2 | 3 | 4 | 5);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session Stats */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Today's Sessions</label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {activeSessions.filter(s => 
                    s.startTime.toDateString() === new Date().toDateString()
                  ).length} completed
                </Badge>
                <Badge variant="outline">
                  {Math.round(activeSessions
                    .filter(s => s.startTime.toDateString() === new Date().toDateString())
                    .reduce((sum, s) => sum + (s.actualDuration || s.plannedDuration), 0) / 60
                  )}h focus time
                </Badge>
              </div>
            </div>
          </div>

          {/* AI Task Recommendations */}
          {taskRecommendations.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                AI Recommendations for Now
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {taskRecommendations.map(({ task, score, reasons }) => (
                  <Card key={task.id} className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => setSelectedTask(task)}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm line-clamp-2">{task.title}</h5>
                        <Badge variant="outline" className="text-xs">
                          {score}% match
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {reasons.slice(0, 2).map((reason, i) => (
                          <p key={i} className="text-xs text-gray-600">• {reason}</p>
                        ))}
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Badge variant="outline">
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">
                          {task.energyLevel}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus Mode Tabs */}
      <Tabs defaultValue="intelligent" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="intelligent" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Intelligent Session
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Adaptive Pomodoro
          </TabsTrigger>
          <TabsTrigger value="distractions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Distraction Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligent" className="space-y-4">
          <IntelligentFocusSession
            selectedTask={selectedTask}
            onSessionComplete={handleSessionComplete}
            onSessionUpdate={handleSessionUpdate}
          />
        </TabsContent>

        <TabsContent value="pomodoro" className="space-y-4">
          <AdaptivePomodoro
            selectedTask={selectedTask}
            userEnergyLevel={energyLevel}
            onSessionComplete={handleSessionComplete}
            sessionHistory={activeSessions}
          />
        </TabsContent>

        <TabsContent value="distractions" className="space-y-4">
          <DistractionManager
            isSessionActive={isSessionActive}
            onDistractionLogged={handleDistractionLogged}
            sessionId={activeSessionId || undefined}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Session History */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSessions.slice(-5).reverse().map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{session.type}</p>
                    <p className="text-sm text-gray-600">
                      {session.actualDuration || session.plannedDuration}min • 
                      Focus: {session.focusQuality}/5 • 
                      Energy: {session.energyBefore}/5
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={session.completed ? "default" : "secondary"}>
                      {session.completed ? "Completed" : "Stopped"}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.startTime.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};