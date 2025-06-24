import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Timer, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Settings,
  Brain,
  TrendingUp,
  Zap,
  Coffee
} from "lucide-react";
import { AdaptivePomodoroSettings, FocusSession } from "@/types/FocusMode";
import { Task } from "@/types/Task";

interface AdaptivePomodoroProps {
  selectedTask?: Task;
  userEnergyLevel: 1 | 2 | 3 | 4 | 5;
  onSessionComplete: (session: FocusSession) => void;
  sessionHistory: FocusSession[];
}

export const AdaptivePomodoro = ({ 
  selectedTask, 
  userEnergyLevel,
  onSessionComplete,
  sessionHistory 
}: AdaptivePomodoroProps) => {
  const [settings, setSettings] = useState<AdaptivePomodoroSettings>({
    baseWorkDuration: 25,
    baseBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    adaptationEnabled: true,
    energyBasedAdjustment: true,
    taskComplexityAdjustment: true,
    progressiveDifficulty: false,
    maxWorkDuration: 90,
    minWorkDuration: 15
  });

  const [currentSession, setCurrentSession] = useState<{
    type: "work" | "break" | "long-break";
    duration: number;
    timeRemaining: number;
    sessionNumber: number;
    isActive: boolean;
    startTime?: Date;
  } | null>(null);

  const [adaptedDurations, setAdaptedDurations] = useState({
    work: 25,
    break: 5,
    longBreak: 15
  });

  // Calculate AI-optimized session durations
  const calculateOptimalDurations = useCallback(() => {
    let workDuration = settings.baseWorkDuration;
    let breakDuration = settings.baseBreakDuration;

    if (settings.adaptationEnabled) {
      // Energy-based adjustments
      if (settings.energyBasedAdjustment) {
        const energyMultiplier = (userEnergyLevel - 3) * 0.2; // -0.4 to +0.4
        workDuration = Math.round(workDuration * (1 + energyMultiplier));
        breakDuration = Math.round(breakDuration * (1 - energyMultiplier * 0.5));
      }

      // Task complexity adjustments
      if (settings.taskComplexityAdjustment && selectedTask) {
        const complexityMultiplier = (selectedTask.complexity - 3) * 0.15; // -0.3 to +0.3
        workDuration = Math.round(workDuration * (1 + complexityMultiplier));
      }

      // Historical performance adjustments
      if (sessionHistory.length > 0) {
        const recentSessions = sessionHistory.slice(-10);
        const avgFocusQuality = recentSessions.reduce((sum, s) => sum + s.focusQuality, 0) / recentSessions.length;
        
        if (avgFocusQuality < 3) {
          // Reduce duration if focus quality is poor
          workDuration = Math.round(workDuration * 0.8);
          breakDuration = Math.round(breakDuration * 1.2);
        } else if (avgFocusQuality > 4) {
          // Increase duration if focus quality is excellent
          workDuration = Math.round(workDuration * 1.1);
        }
      }

      // Progressive difficulty
      if (settings.progressiveDifficulty) {
        const todaysSessions = sessionHistory.filter(s => 
          s.startTime.toDateString() === new Date().toDateString()
        ).length;
        
        if (todaysSessions > 0) {
          const progressiveIncrease = Math.min(todaysSessions * 2, 10); // Max 10 minutes increase
          workDuration += progressiveIncrease;
        }
      }

      // Apply bounds
      workDuration = Math.max(settings.minWorkDuration, Math.min(settings.maxWorkDuration, workDuration));
      breakDuration = Math.max(3, Math.min(20, breakDuration));
    }

    setAdaptedDurations({
      work: workDuration,
      break: breakDuration,
      longBreak: settings.longBreakDuration
    });
  }, [settings, userEnergyLevel, selectedTask, sessionHistory]);

  useEffect(() => {
    calculateOptimalDurations();
  }, [calculateOptimalDurations]);

  const getSessionNumber = () => {
    const todaysSessions = sessionHistory.filter(s => 
      s.startTime.toDateString() === new Date().toDateString() &&
      s.sessionType === "focus"
    ).length;
    return todaysSessions + 1;
  };

  const shouldTakeLongBreak = (sessionNum: number) => {
    return sessionNum % settings.longBreakInterval === 0;
  };

  const startWorkSession = () => {
    const sessionNum = getSessionNumber();
    const duration = adaptedDurations.work;
    
    setCurrentSession({
      type: "work",
      duration,
      timeRemaining: duration * 60,
      sessionNumber: sessionNum,
      isActive: true,
      startTime: new Date()
    });
  };

  const startBreak = () => {
    if (!currentSession) return;
    
    const isLongBreak = shouldTakeLongBreak(currentSession.sessionNumber);
    const duration = isLongBreak ? adaptedDurations.longBreak : adaptedDurations.break;
    
    setCurrentSession({
      type: isLongBreak ? "long-break" : "break",
      duration,
      timeRemaining: duration * 60,
      sessionNumber: currentSession.sessionNumber,
      isActive: true,
      startTime: new Date()
    });
  };

  const pauseSession = () => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isActive: false });
    }
  };

  const resumeSession = () => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isActive: true });
    }
  };

  const stopSession = () => {
    if (currentSession && currentSession.type === "work") {
      // Create focus session record
      const session: FocusSession = {
        id: `pomodoro-${Date.now()}`,
        taskId: selectedTask?.id,
        type: "pomodoro",
        plannedDuration: currentSession.duration,
        actualDuration: Math.round((currentSession.duration * 60 - currentSession.timeRemaining) / 60),
        startTime: currentSession.startTime!,
        endTime: new Date(),
        breakDuration: adaptedDurations.break,
        energyBefore: userEnergyLevel,
        focusQuality: 3, // Default, could be user-rated
        distractions: [],
        techniques: [],
        environmentFactors: {
          noise: 2,
          lighting: "normal",
          temperature: "comfortable",
          location: "home",
          timeOfDay: "morning"
        },
        completed: currentSession.timeRemaining === 0,
        aiRecommendations: []
      };

      onSessionComplete(session);
    }

    setCurrentSession(null);
  };

  const resetSession = () => {
    setCurrentSession(null);
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentSession?.isActive && currentSession.timeRemaining > 0) {
      interval = setInterval(() => {
        setCurrentSession(prev => {
          if (!prev) return null;
          
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            // Session completed
            if (prev.type === "work") {
              // Work session finished, offer break
              return { ...prev, timeRemaining: 0, isActive: false };
            } else {
              // Break finished, ready for next work session
              return null;
            }
          }
          
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [currentSession?.isActive, currentSession?.timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "work": return "text-red-600";
      case "break": return "text-green-600";
      case "long-break": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case "work": return <Timer className="h-5 w-5" />;
      case "break": return <Coffee className="h-5 w-5" />;
      case "long-break": return <Coffee className="h-5 w-5" />;
      default: return <Timer className="h-5 w-5" />;
    }
  };

  const progress = currentSession 
    ? ((currentSession.duration * 60 - currentSession.timeRemaining) / (currentSession.duration * 60)) * 100
    : 0;

  const getAdaptationExplanation = () => {
    const explanations = [];
    
    if (settings.energyBasedAdjustment) {
      const energyEffect = (userEnergyLevel - 3) * 20;
      if (energyEffect > 0) {
        explanations.push(`+${energyEffect}% duration (high energy)`);
      } else if (energyEffect < 0) {
        explanations.push(`${energyEffect}% duration (low energy)`);
      }
    }

    if (settings.taskComplexityAdjustment && selectedTask) {
      const complexityEffect = (selectedTask.complexity - 3) * 15;
      if (complexityEffect > 0) {
        explanations.push(`+${complexityEffect}% for complex task`);
      } else if (complexityEffect < 0) {
        explanations.push(`${complexityEffect}% for simple task`);
      }
    }

    return explanations.length > 0 ? explanations.join(", ") : "Standard duration";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-red-600" />
            Adaptive Pomodoro Timer
            {currentSession && (
              <Badge variant="outline" className={getSessionTypeColor(currentSession.type)}>
                {currentSession.type} #{currentSession.sessionNumber}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className={`text-6xl font-mono font-bold ${currentSession ? getSessionTypeColor(currentSession.type) : 'text-gray-400'}`}>
              {currentSession ? formatTime(currentSession.timeRemaining) : "--:--"}
            </div>

            {currentSession && (
              <>
                <Progress value={progress} className="h-3" />
                <div className="flex items-center justify-center gap-2">
                  {getSessionTypeIcon(currentSession.type)}
                  <span className="text-lg capitalize">
                    {currentSession.type.replace("-", " ")} Session
                  </span>
                </div>
              </>
            )}

            {/* Control Buttons */}
            <div className="flex justify-center gap-2">
              {!currentSession && (
                <Button onClick={startWorkSession} size="lg" className="px-8">
                  <Play className="h-4 w-4 mr-2" />
                  Start Pomodoro
                </Button>
              )}

              {currentSession && (
                <>
                  {currentSession.isActive ? (
                    <Button onClick={pauseSession} variant="outline" size="lg">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeSession} size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}

                  <Button onClick={stopSession} variant="outline" size="lg">
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>

                  <Button onClick={resetSession} variant="outline" size="lg">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}

              {currentSession?.type === "work" && currentSession.timeRemaining === 0 && (
                <Button onClick={startBreak} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Coffee className="h-4 w-4 mr-2" />
                  Start Break
                </Button>
              )}
            </div>
          </div>

          {/* AI Adaptations Info */}
          {settings.adaptationEnabled && (
            <Card className="bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-purple-900 mb-2">AI Adaptations Active</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-purple-700 font-medium">Work Duration</p>
                        <p className="text-purple-800">{adaptedDurations.work} min</p>
                        <p className="text-xs text-purple-600">
                          {adaptedDurations.work !== settings.baseWorkDuration ? 
                            `Adapted from ${settings.baseWorkDuration}m` : 
                            "Standard duration"
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-700 font-medium">Break Duration</p>
                        <p className="text-purple-800">{adaptedDurations.break} min</p>
                      </div>
                      <div>
                        <p className="text-purple-700 font-medium">Next Break</p>
                        <p className="text-purple-800">
                          {shouldTakeLongBreak(getSessionNumber()) ? "Long" : "Short"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">
                      {getAdaptationExplanation()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Context */}
          {selectedTask && (
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">Working On</h4>
                <p className="text-blue-800 mb-2">{selectedTask.title}</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-blue-700">
                    Complexity: {selectedTask.complexity}/5
                  </Badge>
                  <Badge variant="outline" className="text-blue-700">
                    Energy: {selectedTask.energyLevel}
                  </Badge>
                  <Badge variant="outline" className="text-blue-700">
                    {selectedTask.context}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Panel */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="advanced">AI Adaptations</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Work Duration (min)</label>
                  <Slider
                    value={[settings.baseWorkDuration]}
                    onValueChange={(value) => setSettings({...settings, baseWorkDuration: value[0]})}
                    max={60}
                    min={10}
                    step={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">{settings.baseWorkDuration} minutes</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Break Duration (min)</label>
                  <Slider
                    value={[settings.baseBreakDuration]}
                    onValueChange={(value) => setSettings({...settings, baseBreakDuration: value[0]})}
                    max={15}
                    min={3}
                    step={1}
                  />
                  <p className="text-xs text-gray-500 mt-1">{settings.baseBreakDuration} minutes</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Long Break Duration (min)</label>
                  <Slider
                    value={[settings.longBreakDuration]}
                    onValueChange={(value) => setSettings({...settings, longBreakDuration: value[0]})}
                    max={30}
                    min={10}
                    step={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">{settings.longBreakDuration} minutes</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Long Break Interval</label>
                  <Slider
                    value={[settings.longBreakInterval]}
                    onValueChange={(value) => setSettings({...settings, longBreakInterval: value[0]})}
                    max={8}
                    min={2}
                    step={1}
                  />
                  <p className="text-xs text-gray-500 mt-1">Every {settings.longBreakInterval} sessions</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>Enable AI Adaptations</span>
                  </div>
                  <Switch 
                    checked={settings.adaptationEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, adaptationEnabled: checked})}
                  />
                </div>

                {settings.adaptationEnabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Energy-Based Adjustment</span>
                      </div>
                      <Switch 
                        checked={settings.energyBasedAdjustment}
                        onCheckedChange={(checked) => setSettings({...settings, energyBasedAdjustment: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Task Complexity Adjustment</span>
                      </div>
                      <Switch 
                        checked={settings.taskComplexityAdjustment}
                        onCheckedChange={(checked) => setSettings({...settings, taskComplexityAdjustment: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Progressive Difficulty</span>
                      </div>
                      <Switch 
                        checked={settings.progressiveDifficulty}
                        onCheckedChange={(checked) => setSettings({...settings, progressiveDifficulty: checked})}
                      />
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                      <p className="font-medium mb-1">AI Adaptations:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Adjusts session length based on your energy level</li>
                        <li>• Considers task complexity for optimal duration</li>
                        <li>• Learns from your focus quality history</li>
                        <li>• Progressively increases challenge throughout the day</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Today's Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {sessionHistory.filter(s => 
                      s.startTime.toDateString() === new Date().toDateString() &&
                      s.sessionType === "focus"
                    ).length}
                  </p>
                  <p className="text-sm text-gray-600">Pomodoros</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(sessionHistory
                      .filter(s => s.startTime.toDateString() === new Date().toDateString())
                      .reduce((sum, s) => sum + (s.actualDuration || s.plannedDuration), 0) / 60
                    )}h
                  </p>
                  <p className="text-sm text-gray-600">Focus Time</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {sessionHistory.length > 0 ? 
                      Math.round(sessionHistory
                        .filter(s => s.startTime.toDateString() === new Date().toDateString())
                        .reduce((sum, s) => sum + s.focusQuality, 0) / 
                        sessionHistory.filter(s => s.startTime.toDateString() === new Date().toDateString()).length * 20
                      ) : 0
                    }%
                  </p>
                  <p className="text-sm text-gray-600">Avg Focus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};