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
  Minus,
  User,
  LogOut,
  CheckSquare,
  Timer,
  Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export const ResponsiveDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch dashboard stats
  const { data: stats = {
    tasksCompleted: 0,
    timeTracked: 0,
    focusScore: 75,
    streakDays: 0,
    currentSessionTime: 0
  }, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch weekly activity
  const { data: weeklyActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ["/api/dashboard/activity"],
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatSessionTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-3 h-3 text-green-500" />;
      case 'down': return <ArrowDown className="w-3 h-3 text-red-500" />;
      default: return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  if (statsLoading || activityLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            {formatTime(currentTime)} • {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = "/api/logout"}
            className="text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-blue-600 font-medium">Tasks Done</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-800">{stats.tasksCompleted}</p>
                <p className="text-xs lg:text-sm text-blue-600">Today</p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-200 rounded-full">
                <CheckSquare className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-green-600 font-medium">Focus Time</p>
                <p className="text-xl lg:text-2xl font-bold text-green-800">
                  {formatSessionTime(stats.timeTracked)}
                </p>
                <p className="text-xs lg:text-sm text-green-600">Today</p>
              </div>
              <div className="p-2 lg:p-3 bg-green-200 rounded-full">
                <Clock className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-purple-600 font-medium">Focus Score</p>
                <p className="text-xl lg:text-2xl font-bold text-purple-800">{stats.focusScore}/100</p>
                <Progress value={stats.focusScore} className="w-12 lg:w-16 h-1 mt-1" />
              </div>
              <div className="p-2 lg:p-3 bg-purple-200 rounded-full">
                <Brain className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-orange-600 font-medium">Streak</p>
                <p className="text-xl lg:text-2xl font-bold text-orange-800">{stats.streakDays}</p>
                <p className="text-xs lg:text-sm text-orange-600">Days</p>
              </div>
              <div className="p-2 lg:p-3 bg-orange-200 rounded-full">
                <Zap className="w-4 h-4 lg:w-6 lg:h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Session & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Current Session */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Current Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.currentSessionTime > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-800">
                      {formatSessionTime(stats.currentSessionTime)}
                    </p>
                    <p className="text-sm text-gray-600">Active session</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                    <Button size="sm" variant="destructive">
                      Stop
                    </Button>
                  </div>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-sm text-gray-500">65% of planned session time</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No active session</p>
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Start Focus Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg lg:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Timer className="w-4 h-4 mr-2" />
              Start Timer
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Set Goal
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Weekly Activity
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={timeRange === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('today')}
              >
                Today
              </Button>
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 lg:gap-4">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="text-center space-y-2">
                <p className="text-xs lg:text-sm font-medium text-gray-600">{day.day}</p>
                <div className="h-20 lg:h-24 bg-gray-100 rounded-lg relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg transition-all duration-300"
                    style={{ height: `${Math.min(day.hours / 8 * 100, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className="text-xs font-medium text-white">
                      {day.hours.toFixed(1)}h
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-gray-600">{day.tasks} tasks</span>
                  {getTrendIcon(day.trend)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};