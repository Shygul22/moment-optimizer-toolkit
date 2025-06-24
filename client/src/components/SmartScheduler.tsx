
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Zap, Brain, Play, Pause } from "lucide-react";
import { Task } from "@/types/Task";
import { TimeBlock } from "@/types/TimeTracking";
import { TimeBlockingAI } from "@/utils/timeBlockingAI";
import { useToast } from "@/hooks/use-toast";

interface SmartSchedulerProps {
  tasks: Task[];
  onStartTimeBlock: (block: TimeBlock) => void;
}

export const SmartScheduler = ({ tasks, onStartTimeBlock }: SmartSchedulerProps) => {
  const [schedule, setSchedule] = useState<TimeBlock[]>([]);
  const [workingHours, setWorkingHours] = useState({ start: 9, end: 17 });
  const [currentBlock, setCurrentBlock] = useState<TimeBlock | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSchedule = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const availableHours = [{ start: workingHours.start, end: workingHours.end }];
    const newSchedule = TimeBlockingAI.generateOptimalSchedule(tasks, availableHours);
    const scheduledWithBreaks = [
      ...newSchedule,
      ...TimeBlockingAI.calculateOptimalBreaks(newSchedule)
    ].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    setSchedule(scheduledWithBreaks);
    setIsGenerating(false);
    
    toast({
      title: "Smart Schedule Generated",
      description: `Created ${newSchedule.length} time blocks optimized for your productivity!`,
    });
  };

  const getBlockTypeColor = (blockType: TimeBlock['blockType']) => {
    const colors = {
      'deep-work': 'bg-indigo-100 text-indigo-700',
      'meetings': 'bg-blue-100 text-blue-700',
      'admin': 'bg-gray-100 text-gray-700',
      'break': 'bg-green-100 text-green-700',
      'learning': 'bg-purple-100 text-purple-700'
    };
    return colors[blockType];
  };

  const getEnergyIcon = (energy: 'low' | 'medium' | 'high') => {
    if (energy === 'high') return <Zap className="w-4 h-4 text-red-500" />;
    if (energy === 'medium') return <Zap className="w-4 h-4 text-yellow-500" />;
    return <Zap className="w-4 h-4 text-green-500" />;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const startTimeBlock = (block: TimeBlock) => {
    setCurrentBlock(block);
    onStartTimeBlock(block);
    toast({
      title: "Time Block Started",
      description: `Now focusing on: ${block.title}`,
    });
  };

  const uncompletedTasks = tasks.filter(task => !task.completed);

  return (
    <div className="space-y-6">
      {/* Schedule Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Smart Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Working Hours:</label>
                <Select 
                  value={workingHours.start.toString()} 
                  onValueChange={(value) => setWorkingHours(prev => ({ ...prev, start: parseInt(value) }))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => i + 6).map(hour => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">to</span>
                <Select 
                  value={workingHours.end.toString()} 
                  onValueChange={(value) => setWorkingHours(prev => ({ ...prev, end: parseInt(value) }))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => i + 12).map(hour => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={generateSchedule} 
                disabled={isGenerating || uncompletedTasks.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Smart Schedule
                  </>
                )}
              </Button>
            </div>
            
            {uncompletedTasks.length === 0 && (
              <p className="text-sm text-gray-500">Add some tasks to generate a smart schedule!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Schedule */}
      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Optimized Schedule
              <Badge variant="secondary" className="ml-2">
                {schedule.filter(b => b.blockType !== 'break').length} blocks
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedule.map((block) => (
                <div
                  key={block.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                    currentBlock?.id === block.id
                      ? "bg-indigo-50 border-indigo-200 shadow-md"
                      : "bg-white border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-sm font-medium text-gray-600">
                        {formatTime(block.startTime)} - {formatTime(block.endTime)}
                      </div>
                      <Badge className={getBlockTypeColor(block.blockType)}>
                        {block.blockType.replace('-', ' ')}
                      </Badge>
                      {block.blockType !== 'break' && getEnergyIcon(block.energyRequired)}
                      {block.aiGenerated && (
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-gray-800">{block.title}</p>
                  </div>
                  
                  {block.blockType !== 'break' && (
                    <Button
                      onClick={() => startTimeBlock(block)}
                      size="sm"
                      variant={currentBlock?.id === block.id ? "secondary" : "default"}
                      className={currentBlock?.id === block.id ? "" : "bg-indigo-600 hover:bg-indigo-700"}
                    >
                      {currentBlock?.id === block.id ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Active
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
