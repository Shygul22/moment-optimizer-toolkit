
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Timer, Zap, Brain, Target } from "lucide-react";
import { TimeSession, TimeBlock } from "@/types/TimeTracking";
import { useToast } from "@/hooks/use-toast";

interface EnhancedTimeTrackerProps {
  activeTimeBlock?: TimeBlock | null;
  onSessionComplete: (session: TimeSession) => void;
}

export const EnhancedTimeTracker = ({ activeTimeBlock, onSessionComplete }: EnhancedTimeTrackerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentSession, setCurrentSession] = useState<TimeSession | null>(null);
  const [sessionType, setSessionType] = useState<TimeSession['sessionType']>('focus');
  const [energyLevel, setEnergyLevel] = useState<TimeSession['energyLevel']>(3);
  const [focusQuality, setFocusQuality] = useState<TimeSession['focusQuality']>(3);
  const [interruptions, setInterruptions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const startSession = () => {
    const session: TimeSession = {
      id: `session-${Date.now()}`,
      taskId: activeTimeBlock?.taskIds[0],
      startTime: new Date(),
      sessionType,
      energyLevel,
      focusQuality: 3, // Will be updated when session ends
      interruptions: 0,
      completed: false
    };
    
    setCurrentSession(session);
    setIsRunning(true);
    setTimeElapsed(0);
    setInterruptions(0);
    
    toast({
      title: "Session Started",
      description: `${sessionType === 'focus' ? 'Focus' : 'Break'} session started!`,
    });
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const stopSession = () => {
    if (currentSession) {
      const completedSession: TimeSession = {
        ...currentSession,
        endTime: new Date(),
        duration: Math.round(timeElapsed / 60), // Convert to minutes
        focusQuality,
        interruptions,
        completed: true
      };
      
      onSessionComplete(completedSession);
      setCurrentSession(null);
      setIsRunning(false);
      setTimeElapsed(0);
      setInterruptions(0);
      
      toast({
        title: "Session Completed",
        description: `Great work! ${completedSession.duration} minutes of ${completedSession.sessionType} time logged.`,
      });
    }
  };

  const addInterruption = () => {
    setInterruptions(prev => prev + 1);
    toast({
      title: "Interruption Logged",
      description: "Don't worry, these happen! Stay focused.",
      variant: "destructive",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionProgress = () => {
    if (!activeTimeBlock) return 0;
    const blockDuration = (activeTimeBlock.endTime.getTime() - activeTimeBlock.startTime.getTime()) / 1000;
    return Math.min((timeElapsed / blockDuration) * 100, 100);
  };

  const getEnergyColor = (level: number) => {
    if (level >= 4) return "text-green-600";
    if (level >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getFocusColor = (quality: number) => {
    if (quality >= 4) return "text-indigo-600";
    if (quality >= 3) return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Active Time Block Display */}
      {activeTimeBlock && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="p-4 lg:p-6">
            <div className="text-center space-y-2">
              <Badge className="bg-indigo-100 text-indigo-700 mb-2">
                Active Time Block
              </Badge>
              <h3 className="text-xl font-semibold text-gray-800">{activeTimeBlock.title}</h3>
              <p className="text-gray-600">
                {activeTimeBlock.startTime.toLocaleTimeString()} - {activeTimeBlock.endTime.toLocaleTimeString()}
              </p>
              <Progress value={getSessionProgress()} className="w-full mt-4" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            AI-Enhanced Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <div className="text-6xl font-mono font-bold text-gray-800">
              {formatTime(timeElapsed)}
            </div>
            
            {/* Session Configuration */}
            {!isRunning && !currentSession && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Session Type</label>
                    <Select value={sessionType} onValueChange={(value: TimeSession['sessionType']) => setSessionType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="focus">Focus Session</SelectItem>
                        <SelectItem value="break">Break</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Energy Level</label>
                    <Select value={energyLevel.toString()} onValueChange={(value) => setEnergyLevel(parseInt(value) as TimeSession['energyLevel'])}>
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
                  
                  <div className="flex items-end">
                    <Button onClick={startSession} className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Active Session Controls */}
            {currentSession && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {sessionType}
                  </Badge>
                  <Badge variant="outline" className={`flex items-center gap-1 ${getEnergyColor(energyLevel)}`}>
                    <Zap className="w-3 h-3" />
                    Energy: {energyLevel}/5
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Interruptions: {interruptions}
                  </Badge>
                </div>
                
                <div className="flex justify-center gap-4">
                  {isRunning ? (
                    <Button onClick={pauseSession} variant="outline">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={() => setIsRunning(true)} className="bg-indigo-600 hover:bg-indigo-700">
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  
                  <Button onClick={addInterruption} variant="outline">
                    +1 Interruption
                  </Button>
                  
                  <Button onClick={stopSession} variant="destructive">
                    <Square className="w-4 h-4 mr-2" />
                    Stop & Rate
                  </Button>
                </div>
                
                {/* Focus Quality Rating (shown when stopping) */}
                {!isRunning && currentSession && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      How was your focus quality?
                    </label>
                    <Select value={focusQuality.toString()} onValueChange={(value) => setFocusQuality(parseInt(value) as TimeSession['focusQuality'])}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Distracted</SelectItem>
                        <SelectItem value="2">2 - Somewhat Distracted</SelectItem>
                        <SelectItem value="3">3 - Moderately Focused</SelectItem>
                        <SelectItem value="4">4 - Very Focused</SelectItem>
                        <SelectItem value="5">5 - Deep Focus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
