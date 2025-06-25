
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Zap, Brain, Play, Pause, BarChart3, Target, Users, Coffee, BookOpen, Settings } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'summary'>('timeline');
  const [schedulePreference, setSchedulePreference] = useState<'balanced' | 'intense' | 'relaxed'>('balanced');
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
      'deep-work': 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200',
      'meetings': 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200',
      'admin': 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200',
      'break': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200',
      'learning': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200'
    };
    return colors[blockType];
  };

  const getBlockIcon = (blockType: TimeBlock['blockType']) => {
    const icons = {
      'deep-work': Target,
      'meetings': Users,
      'admin': Settings,
      'break': Coffee,
      'learning': BookOpen
    };
    return icons[blockType];
  };

  const calculateScheduleStats = () => {
    const totalBlocks = schedule.filter(b => b.blockType !== 'break').length;
    const totalTime = schedule.reduce((acc, block) => {
      const duration = (block.endTime.getTime() - block.startTime.getTime()) / (1000 * 60);
      return acc + duration;
    }, 0);
    const breakTime = schedule
      .filter(b => b.blockType === 'break')
      .reduce((acc, block) => {
        const duration = (block.endTime.getTime() - block.startTime.getTime()) / (1000 * 60);
        return acc + duration;
      }, 0);
    
    return { totalBlocks, totalTime: Math.round(totalTime), breakTime: Math.round(breakTime) };
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
  const scheduleStats = calculateScheduleStats();

  return (
    <div className="space-y-6">
      {/* Enhanced Schedule Generator */}
      <Card className="border-2 border-gradient-to-r from-indigo-200 to-purple-200">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              <span className="text-xl">AI Smart Scheduler</span>
            </div>
            <Badge variant="outline" className="bg-white/50">
              {uncompletedTasks.length} tasks ready
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Configuration Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Working Hours</label>
              <div className="flex items-center gap-2">
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Schedule Style</label>
              <Select value={schedulePreference} onValueChange={(value: any) => setSchedulePreference(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="intense">Intense Focus</SelectItem>
                  <SelectItem value="relaxed">Relaxed Pace</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Generate Schedule</label>
              <Button 
                onClick={generateSchedule} 
                disabled={isGenerating || uncompletedTasks.length === 0}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {uncompletedTasks.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Target className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">Add some tasks to generate your smart schedule!</p>
              <p className="text-sm text-gray-500 mt-1">Create tasks with priorities and let AI optimize your day</p>
            </div>
          )}

          {/* Quick Stats */}
          {schedule.length > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{scheduleStats.totalBlocks}</div>
                <div className="text-sm text-gray-600">Work Blocks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{scheduleStats.totalTime}m</div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{scheduleStats.breakTime}m</div>
                <div className="text-sm text-gray-600">Break Time</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Schedule Display */}
      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Today's Optimized Schedule
                <Badge variant="secondary" className="ml-2">
                  {schedule.filter(b => b.blockType !== 'break').length} blocks
                </Badge>
              </CardTitle>
              
              {/* View Mode Selector */}
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                  <TabsTrigger value="calendar" className="text-xs">Calendar</TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={viewMode} className="w-full">
              {/* Timeline View */}
              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-3">
                  {schedule.map((block, index) => {
                    const Icon = getBlockIcon(block.blockType);
                    const duration = Math.round((block.endTime.getTime() - block.startTime.getTime()) / (1000 * 60));
                    
                    return (
                      <div
                        key={block.id}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                          currentBlock?.id === block.id
                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-lg"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {/* Timeline connector */}
                        {index < schedule.length - 1 && (
                          <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-200"></div>
                        )}
                        
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getBlockTypeColor(block.blockType)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-lg font-semibold text-gray-800">
                              {formatTime(block.startTime)} - {formatTime(block.endTime)}
                            </div>
                            <Badge className={`${getBlockTypeColor(block.blockType)} border`}>
                              {block.blockType.replace('-', ' ')}
                            </Badge>
                            <div className="text-sm text-gray-500">{duration}m</div>
                          </div>
                          <h3 className="font-medium text-gray-800 mb-1">{block.title}</h3>
                          <div className="flex items-center gap-2">
                            {block.blockType !== 'break' && (
                              <>
                                {getEnergyIcon(block.energyRequired)}
                                <span className="text-sm text-gray-600 capitalize">{block.energyRequired} energy</span>
                              </>
                            )}
                            {block.aiGenerated && (
                              <Badge variant="outline" className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200">
                                AI Optimized
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        {block.blockType !== 'break' && (
                          <Button
                            onClick={() => startTimeBlock(block)}
                            size="lg"
                            variant={currentBlock?.id === block.id ? "secondary" : "default"}
                            className={`flex-shrink-0 ${
                              currentBlock?.id === block.id 
                                ? "bg-gray-100 text-gray-700" 
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            }`}
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
                    );
                  })}
                </div>
              </TabsContent>

              {/* Calendar View */}
              <TabsContent value="calendar" className="space-y-4">
                <div className="grid gap-2">
                  {Array.from({length: workingHours.end - workingHours.start}).map((_, hourIndex) => {
                    const hour = workingHours.start + hourIndex;
                    const hourBlocks = schedule.filter(block => 
                      block.startTime.getHours() === hour
                    );
                    
                    return (
                      <div key={hour} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-16 text-sm font-medium text-gray-600">
                          {hour}:00
                        </div>
                        <div className="flex-1">
                          {hourBlocks.length > 0 ? (
                            <div className="flex gap-2">
                              {hourBlocks.map(block => (
                                <div
                                  key={block.id}
                                  className={`flex-1 p-2 rounded text-sm ${getBlockTypeColor(block.blockType)}`}
                                >
                                  {block.title}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">Free time</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Summary View */}
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Schedule Overview */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Schedule Overview</h3>
                    <div className="space-y-3">
                      {Object.entries(
                        schedule.reduce((acc, block) => {
                          acc[block.blockType] = (acc[block.blockType] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getBlockTypeColor(type as any).split(' ')[0]}`}></div>
                            <span className="capitalize">{type.replace('-', ' ')}</span>
                          </div>
                          <Badge variant="outline">{count} blocks</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Productivity Score */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Productivity Score</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Focus Time</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span>Energy Balance</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span>Break Distribution</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
