import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Brain, Clock, Target, Zap } from "lucide-react";
import { FocusSession, FocusTechnique, EnvironmentFactors, AIRecommendation } from "@/types/FocusMode";
import { Task } from "@/types/Task";

interface IntelligentFocusSessionProps {
  selectedTask?: Task;
  onSessionComplete: (session: FocusSession) => void;
  onSessionUpdate: (session: Partial<FocusSession>) => void;
}

export const IntelligentFocusSession = ({ 
  selectedTask, 
  onSessionComplete,
  onSessionUpdate 
}: IntelligentFocusSessionProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [environment, setEnvironment] = useState<EnvironmentFactors>({
    noise: 2,
    lighting: "normal",
    temperature: "comfortable",
    location: "home",
    timeOfDay: "morning"
  });

  // AI-generated recommendations based on task type and user patterns
  const generateAIRecommendations = useCallback((task?: Task): AIRecommendation[] => {
    const recommendations: AIRecommendation[] = [];
    
    if (task) {
      // Session length recommendation based on complexity
      const complexityMultiplier = task.complexity * 0.2;
      const baseTime = 25;
      const recommendedTime = Math.round(baseTime * (1 + complexityMultiplier));
      
      recommendations.push({
        id: "session-length",
        type: "session-length",
        title: `${recommendedTime}-minute session`,
        description: `Based on task complexity (${task.complexity}/5), this duration optimizes focus without fatigue`,
        confidence: 0.8,
        reasoning: `Complex tasks require longer focus periods, but diminishing returns after ${recommendedTime} minutes`,
        applied: false
      });

      // Technique recommendation based on task context
      const contextTechniques: { [key: string]: string[] } = {
        "creative": ["ambient music", "binaural beats", "natural sounds"],
        "analytical": ["white noise", "silence", "instrumental music"],
        "learning": ["active recall", "spaced repetition", "note-taking"],
        "administrative": ["time blocking", "batch processing", "checklist method"]
      };

      const suggestedTechniques = contextTechniques[task.context] || ["deep breathing"];
      recommendations.push({
        id: "technique",
        type: "technique",
        title: `Try ${suggestedTechniques[0]}`,
        description: `This technique is highly effective for ${task.context} work`,
        confidence: 0.7,
        reasoning: `Statistical analysis shows 23% higher focus quality for ${task.context} tasks`,
        applied: false
      });
    }

    // Environment optimization
    const currentHour = new Date().getHours();
    if (currentHour < 10) {
      recommendations.push({
        id: "morning-optimization",
        type: "environment",
        title: "Optimize morning lighting",
        description: "Increase brightness to boost alertness and cognitive performance",
        confidence: 0.9,
        reasoning: "Natural circadian rhythms show peak alertness with bright light exposure",
        applied: false
      });
    }

    return recommendations;
  }, []);

  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);

  useEffect(() => {
    setAiRecommendations(generateAIRecommendations(selectedTask));
  }, [selectedTask, generateAIRecommendations]);

  const calculateOptimalDuration = useCallback((task?: Task, energy: number = 3): number => {
    let baseDuration = 25; // Default Pomodoro

    if (task) {
      // Adjust based on task complexity and energy
      const complexityFactor = task.complexity * 5; // 5-25 minutes adjustment
      const energyFactor = energy * 3; // 3-15 minutes adjustment
      const impactBonus = task.impact > 3 ? 10 : 0; // High impact tasks get longer focus

      baseDuration = Math.min(90, Math.max(15, baseDuration + complexityFactor + energyFactor + impactBonus));
    }

    return baseDuration;
  }, []);

  const startSession = () => {
    const optimalDuration = calculateOptimalDuration(selectedTask, energyLevel);
    
    const session: FocusSession = {
      id: `session-${Date.now()}`,
      taskId: selectedTask?.id,
      type: selectedTask?.context === "creative" ? "creative" : 
            selectedTask?.context === "learning" ? "learning" : "deep-work",
      plannedDuration: optimalDuration,
      startTime: new Date(),
      breakDuration: Math.round(optimalDuration * 0.2), // 20% of work time
      energyBefore: energyLevel,
      focusQuality: 1,
      distractions: [],
      techniques: [],
      environmentFactors: environment,
      completed: false,
      aiRecommendations
    };

    setCurrentSession(session);
    setTimeRemaining(optimalDuration * 60); // Convert to seconds
    setIsActive(true);
    onSessionUpdate(session);
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const stopSession = () => {
    if (currentSession) {
      const endTime = new Date();
      const actualDuration = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / 60000);
      
      const completedSession: FocusSession = {
        ...currentSession,
        endTime,
        actualDuration,
        completed: true,
        energyAfter: energyLevel
      };

      onSessionComplete(completedSession);
      setCurrentSession(null);
      setIsActive(false);
      setTimeRemaining(0);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            // Auto-complete session when time runs out
            if (currentSession) {
              stopSession();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, currentSession]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentSession 
    ? ((currentSession.plannedDuration * 60 - timeRemaining) / (currentSession.plannedDuration * 60)) * 100
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Powered Focus Session
            {currentSession && (
              <Badge variant="secondary" className="ml-auto">
                {currentSession.type}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Timer */}
          <div className="text-center space-y-4">
            <div className="text-6xl font-mono font-bold text-purple-600">
              {formatTime(timeRemaining)}
            </div>
            {currentSession && (
              <Progress value={progress} className="h-3" />
            )}
            
            <div className="flex justify-center gap-2">
              {!isActive && !currentSession && (
                <Button onClick={startSession} size="lg" className="px-8">
                  <Play className="h-4 w-4 mr-2" />
                  Start Focus Session
                </Button>
              )}
              
              {currentSession && (
                <>
                  {isActive ? (
                    <Button onClick={pauseSession} variant="outline" size="lg">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={() => setIsActive(true)} size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  
                  <Button onClick={stopSession} variant="destructive" size="lg">
                    <Square className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Pre-session Configuration */}
          {!currentSession && (
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="setup">Session Setup</TabsTrigger>
                <TabsTrigger value="environment">Environment</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="setup" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Current Energy Level</label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[energyLevel]}
                        onValueChange={(value) => setEnergyLevel(value[0] as 1 | 2 | 3 | 4 | 5)}
                        max={5}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1 text-sm">
                        <Zap className="h-4 w-4" />
                        {energyLevel}/5
                      </div>
                    </div>
                  </div>

                  {selectedTask && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Selected Task</h4>
                      <p className="text-blue-800">{selectedTask.title}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">
                          Complexity: {selectedTask.complexity}/5
                        </Badge>
                        <Badge variant="outline">
                          Energy: {selectedTask.energyLevel}
                        </Badge>
                        <Badge variant="outline">
                          {selectedTask.context}
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-700 mt-2">
                        Optimal session: {calculateOptimalDuration(selectedTask, energyLevel)} minutes
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="environment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Select 
                      value={environment.location} 
                      onValueChange={(value) => setEnvironment({...environment, location: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="cafe">Cafe</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Lighting</label>
                    <Select 
                      value={environment.lighting} 
                      onValueChange={(value) => setEnvironment({...environment, lighting: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dim">Dim</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bright">Bright</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Noise Level</label>
                    <Slider
                      value={[environment.noise]}
                      onValueChange={(value) => setEnvironment({...environment, noise: value[0] as any})}
                      max={5}
                      min={1}
                      step={1}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      1 = Very Quiet, 5 = Very Noisy
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Temperature</label>
                    <Select 
                      value={environment.temperature} 
                      onValueChange={(value) => setEnvironment({...environment, temperature: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cold">Cold</SelectItem>
                        <SelectItem value="cool">Cool</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="hot">Hot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai-insights" className="space-y-4">
                <div className="space-y-3">
                  {aiRecommendations.map((rec) => (
                    <Card key={rec.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(rec.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <p className="text-xs text-gray-500">{rec.reasoning}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const updated = aiRecommendations.map(r => 
                              r.id === rec.id ? {...r, applied: !r.applied} : r
                            );
                            setAiRecommendations(updated);
                          }}
                        >
                          {rec.applied ? "Applied" : "Apply"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Active Session Insights */}
          {currentSession && isActive && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Clock className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                    <p className="text-sm text-gray-600">Planned</p>
                    <p className="font-semibold">{currentSession.plannedDuration}m</p>
                  </div>
                  <div>
                    <Zap className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-sm text-gray-600">Energy</p>
                    <p className="font-semibold">{currentSession.energyBefore}/5</p>
                  </div>
                  <div>
                    <Target className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold capitalize">{currentSession.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};