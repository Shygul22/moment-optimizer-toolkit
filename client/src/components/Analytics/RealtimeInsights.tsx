import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Zap, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface RealtimeMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
  status: "good" | "warning" | "critical";
  description: string;
}

export const RealtimeInsights = () => {
  const [metrics, setMetrics] = useState<RealtimeMetric[]>([]);
  const [currentFocusQuality, setCurrentFocusQuality] = useState(85);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [sessionProgress, setSessionProgress] = useState(0);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate dynamic metrics
      const newMetrics: RealtimeMetric[] = [
        {
          id: "focus-quality",
          label: "Current Focus Quality",
          value: Math.max(60, Math.min(100, currentFocusQuality + (Math.random() - 0.5) * 10)),
          unit: "%",
          trend: Math.random() > 0.5 ? "up" : "down",
          changePercent: Math.floor(Math.random() * 10) + 1,
          status: currentFocusQuality > 80 ? "good" : currentFocusQuality > 60 ? "warning" : "critical",
          description: "Real-time assessment of focus depth and attention quality"
        },
        {
          id: "productivity-velocity",
          label: "Productivity Velocity",
          value: Math.floor(Math.random() * 40) + 60,
          unit: "tasks/hr",
          trend: "up",
          changePercent: 12,
          status: "good",
          description: "Rate of task completion based on current performance"
        },
        {
          id: "energy-level",
          label: "Energy Level",
          value: energyLevel,
          unit: "/5",
          trend: Math.random() > 0.6 ? "down" : "stable",
          changePercent: 5,
          status: energyLevel > 3 ? "good" : energyLevel > 2 ? "warning" : "critical",
          description: "Current energy and alertness assessment"
        },
        {
          id: "distraction-resistance",
          label: "Distraction Resistance",
          value: Math.floor(Math.random() * 30) + 70,
          unit: "%",
          trend: "stable",
          changePercent: 2,
          status: "good",
          description: "Ability to maintain focus despite environmental factors"
        }
      ];

      setMetrics(newMetrics);
      setCurrentFocusQuality(newMetrics[0].value);
      
      // Update session progress
      setSessionProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentFocusQuality, energyLevel]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const currentAlerts = [
    {
      type: "info",
      message: "Peak focus window detected - optimal time for complex tasks",
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      type: "warning", 
      message: "Energy level declining - consider a short break in 15 minutes",
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-4">
      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}{metric.unit}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {getTrendIcon(metric.trend)}
                    <span>{metric.changePercent}%</span>
                  </div>
                </div>
                <Badge className={getStatusBadge(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {metric.description}
              </p>
            </CardContent>
            
            {/* Animated border for real-time effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse"></div>
          </Card>
        ))}
      </div>

      {/* Current Session Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Current Session Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Session Completion</span>
              <span className="text-sm font-bold text-purple-600">{sessionProgress}%</span>
            </div>
            <Progress value={sessionProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-lg font-bold text-blue-600">23:47</div>
                <div className="text-gray-600">Time Elapsed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">6:13</div>
                <div className="text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">3</div>
                <div className="text-gray-600">Interruptions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Alerts */}
      <div className="space-y-2">
        {currentAlerts.map((alert, index) => (
          <Alert key={index} className={`
            ${alert.type === "warning" ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50"}
            animate-in slide-in-from-right duration-300
          `}>
            <AlertDescription className="flex items-center gap-2">
              {alert.icon}
              <span>{alert.message}</span>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Live Performance Indicators */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live Performance Tracking</span>
            </div>
            <Badge variant="outline" className="animate-pulse">
              Real-time
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Energy</span>
              </div>
              <div className="text-lg font-bold text-yellow-600">{energyLevel}/5</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Flow State</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {currentFocusQuality > 80 ? "Deep" : currentFocusQuality > 60 ? "Moderate" : "Light"}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Efficiency</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {Math.round((currentFocusQuality / 100) * (energyLevel / 5) * 100)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};