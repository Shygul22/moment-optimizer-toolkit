
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Pause, Square, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TimeSession } from "@/types/TimeTracking";

export const TimeTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!currentTask.trim()) {
      toast({
        title: "Task required",
        description: "Please enter a task name before starting the timer.",
        variant: "destructive",
      });
      return;
    }
    setIsRunning(true);
    setStartTime(new Date());
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (time > 0 && currentTask && startTime) {
      const session: TimeSession = {
        id: Date.now().toString(),
        taskId: undefined,
        startTime,
        endTime: new Date(),
        duration: time,
        sessionType: "focus",
        energyLevel: 3,
        focusQuality: 3,
        interruptions: 0,
        notes: `Tracked time for: ${currentTask}`,
        completed: true,
      };
      setSessions([session, ...sessions]);
      toast({
        title: "Session completed",
        description: `${formatTime(time)} tracked for "${currentTask}"`,
      });
    }
    setIsRunning(false);
    setTime(0);
    setCurrentTask("");
    setStartTime(null);
  };

  const totalTimeToday = sessions
    .filter(session => {
      const today = new Date();
      return session.startTime.toDateString() === today.toDateString();
    })
    .reduce((total, session) => total + (session.duration || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Timer Display */}
      <Card className="text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="text-6xl font-mono font-bold text-indigo-600 mb-4">
              {formatTime(time)}
            </div>
            <Input
              placeholder="What are you working on?"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              className="max-w-md mx-auto text-center text-lg"
              disabled={isRunning}
            />
          </div>
          
          <div className="flex justify-center gap-4">
            {!isRunning ? (
              <Button
                onClick={startTimer}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <Play size={20} className="mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={pauseTimer}
                size="lg"
                variant="outline"
                className="px-8"
              >
                <Pause size={20} className="mr-2" />
                Pause
              </Button>
            )}
            
            <Button
              onClick={stopTimer}
              size="lg"
              variant="destructive"
              className="px-8"
              disabled={time === 0}
            >
              <Square size={20} className="mr-2" />
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Time Today</p>
              <p className="text-3xl font-bold text-indigo-600">{formatTime(totalTimeToday)}</p>
            </div>
            <div className="p-4 bg-indigo-100 rounded-full">
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No sessions yet. Start tracking your time!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{session.notes || 'Time tracking session'}</p>
                    <p className="text-sm text-gray-600">
                      {session.startTime.toLocaleDateString()} at {session.startTime.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-indigo-600">
                      {formatTime(session.duration || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
