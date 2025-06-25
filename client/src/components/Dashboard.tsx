
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Activity, 
  Zap, 
  Calendar,
  Brain,
  Play,
  Pause,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

export const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic data state
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    timeTracked: 0, // minutes
    focusScore: 0,
    streakDays: 0,
    todayGoal: 480, // 8 hours in minutes
    currentSessionTime: 0,
  });

  const [realtimeData, setRealtimeData] = useState({
    currentFocus: 75,
    energyLevel: 70,
    interruptions: 0,
    currentTask: "",
    sessionStartTime: new Date(),
  });

  const [weeklyData, setWeeklyData] = useState<{
    day: string;
    hours: number;
    tasks: number;
    productivity: number;
    trend: string;
  }[]>([]);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(prev => ({
          ...prev,
          tasksCompleted: statsData.tasksCompleted,
          timeTracked: statsData.timeTracked,
          focusScore: statsData.focusScore,
          streakDays: statsData.streakDays,
          currentSessionTime: statsData.currentSessionTime,
        }));
      }

      // Fetch weekly activity
      const weeklyResponse = await fetch('/api/dashboard/weekly-activity');
      if (weeklyResponse.ok) {
        const weeklyActivityData = await weeklyResponse.json();
        setWeeklyData(weeklyActivityData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update session time if there's an active session
      if (stats.currentSessionTime > 0) {
        setStats(prev => ({
          ...prev,
          currentSessionTime: prev.currentSessionTime + 1,
        }));
      }

      // Refresh data periodically
      if (Math.random() < 0.1) { // 10% chance every minute to refresh
        fetchDashboardData();
      }

      // Simulate focus score fluctuation for demo
      setRealtimeData(prev => ({
        ...prev,
        currentFocus: Math.max(60, Math.min(100, prev.currentFocus + (Math.random() - 0.5) * 3)),
        energyLevel: Math.max(40, Math.min(100, prev.energyLevel + (Math.random() - 0.5) * 2)),
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isLive, stats.currentSessionTime]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatSessionTime = (startTime: Date) => {
    const diff = Math.floor((currentTime.getTime() - startTime.getTime()) / 60000);
    return formatTime(diff);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="w-3 h-3 text-green-500" />;
      case "down": return <ArrowDown className="w-3 h-3 text-red-500" />;
      default: return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const maxHours = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.hours)) : 1;
  const todayProgress = (stats.timeTracked / stats.todayGoal) * 100;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Live Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Productivity Dashboard</h1>
          <div className="flex items-center gap-2">
            {isLive ? (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Paused</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className={isLive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
          >
            {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Current Session Card */}
      {realtimeData.currentTask && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-gray-800">Active Work Session</p>
                  <p className="text-sm text-gray-600">
                    Session time: {formatTime(stats.currentSessionTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{Math.round(realtimeData.currentFocus)}%</div>
                  <div className="text-xs text-gray-600">Focus</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{Math.round(realtimeData.energyLevel)}%</div>
                  <div className="text-xs text-gray-600">Energy</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeMetric === 'tasks' ? 'ring-2 ring-green-200 shadow-lg' : ''
          }`}
          onClick={() => setActiveMetric(activeMetric === 'tasks' ? null : 'tasks')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-3xl font-bold text-green-600 transition-all duration-300">
                  {stats.tasksCompleted}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">+2 from yesterday</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>
            {activeMetric === 'tasks' && (
              <div className="mt-4 pt-4 border-t">
                <Progress value={(stats.tasksCompleted / 15) * 100} className="h-2" />
                <p className="text-xs text-gray-600 mt-2">Daily goal: 15 tasks</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeMetric === 'time' ? 'ring-2 ring-blue-200 shadow-lg' : ''
          }`}
          onClick={() => setActiveMetric(activeMetric === 'time' ? null : 'time')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Tracked</p>
                <p className="text-3xl font-bold text-blue-600 transition-all duration-300">
                  {formatTime(stats.timeTracked)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600">+45m from yesterday</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            {activeMetric === 'time' && (
              <div className="mt-4 pt-4 border-t">
                <Progress value={todayProgress} className="h-2" />
                <p className="text-xs text-gray-600 mt-2">
                  Daily goal: {formatTime(stats.todayGoal)} ({Math.round(todayProgress)}% complete)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeMetric === 'focus' ? 'ring-2 ring-purple-200 shadow-lg' : ''
          }`}
          onClick={() => setActiveMetric(activeMetric === 'focus' ? null : 'focus')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Focus Score</p>
                <p className="text-3xl font-bold text-purple-600 transition-all duration-300">
                  {stats.focusScore}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-purple-600">+7% from last week</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            {activeMetric === 'focus' && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Current session</span>
                  <span>{Math.round(realtimeData.currentFocus)}%</span>
                </div>
                <Progress value={realtimeData.currentFocus} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            activeMetric === 'streak' ? 'ring-2 ring-orange-200 shadow-lg' : ''
          }`}
          onClick={() => setActiveMetric(activeMetric === 'streak' ? null : 'streak')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600 transition-all duration-300">
                  {stats.streakDays} days
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600">Personal best!</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            {activeMetric === 'streak' && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-1">
                  {Array.from({length: 7}).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full ${
                        i < stats.streakDays ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">Weekly streak progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Activity Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div 
                  key={day.day} 
                  className="group hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-600">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{day.tasks} tasks</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(day.trend)}
                          <span className="text-xs text-gray-500">{day.productivity}%</span>
                        </div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                          style={{ 
                            width: `${(day.hours / maxHours) * 100}%`,
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          <span className="text-white text-xs font-medium">
                            {day.hours}h
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Current Focus</span>
                  <span className="text-lg font-bold text-blue-600">
                    {Math.round(realtimeData.currentFocus)}%
                  </span>
                </div>
                <Progress 
                  value={realtimeData.currentFocus} 
                  className="h-3 bg-blue-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Energy Level</span>
                  <span className="text-lg font-bold text-green-600">
                    {Math.round(realtimeData.energyLevel)}%
                  </span>
                </div>
                <Progress 
                  value={realtimeData.energyLevel} 
                  className="h-3 bg-green-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Today's Progress</span>
                  <span className="text-lg font-bold text-purple-600">
                    {Math.round(todayProgress)}%
                  </span>
                </div>
                <Progress 
                  value={todayProgress} 
                  className="h-3 bg-purple-100"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-500">{realtimeData.interruptions}</div>
                    <div className="text-xs text-gray-600">Interruptions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-500">
                      {formatTime(stats.currentSessionTime)}
                    </div>
                    <div className="text-xs text-gray-600">Session Time</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <Badge variant="outline" className="text-xs">Peak Performance</Badge>
                  </div>
                  <h4 className="font-semibold text-blue-800 mb-2">Morning Focus Window</h4>
                  <p className="text-sm text-blue-700">
                    Your focus quality is 40% higher between 9-11 AM. Schedule complex tasks during this window.
                  </p>
                  <div className="mt-2">
                    <Badge className="bg-blue-100 text-blue-700">87% confidence</Badge>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Badge variant="outline" className="text-xs">Break Optimization</Badge>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Optimal Break Duration</h4>
                  <p className="text-sm text-green-700">
                    7-minute breaks improve your next session focus by 23% compared to 5-minute breaks.
                  </p>
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-700">73% confidence</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-800">Productivity Peak</p>
                      <p className="text-sm text-gray-600">Tuesday & Thursday mornings</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">+25% vs average</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">Optimal Session Length</p>
                      <p className="text-sm text-gray-600">25-30 minutes for deep work</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Best focus</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-800">Energy Dip</p>
                      <p className="text-sm text-gray-600">Post-lunch (1-3 PM)</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700">-15% efficiency</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Time Blocking</h4>
                  <p className="text-sm text-purple-700">
                    Schedule specific time blocks for different types of work to maintain focus and reduce context switching.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Energy Management</h4>
                  <p className="text-sm text-orange-700">
                    Match high-energy tasks with your peak hours and save administrative work for low-energy periods.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
