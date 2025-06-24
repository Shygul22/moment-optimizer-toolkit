import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Bell, 
  Volume2, 
  Smartphone, 
  Monitor, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Eye
} from "lucide-react";
import { Distraction } from "@/types/FocusMode";

interface DistractionManagerProps {
  isSessionActive: boolean;
  onDistractionLogged: (distraction: Distraction) => void;
  sessionId?: string;
}

export const DistractionManager = ({ 
  isSessionActive, 
  onDistractionLogged,
  sessionId 
}: DistractionManagerProps) => {
  const [distractions, setDistractions] = useState<Distraction[]>([]);
  const [focusScore, setFocusScore] = useState(100);
  const [notificationBlocking, setNotificationBlocking] = useState(false);
  const [environmentOptimization, setEnvironmentOptimization] = useState(false);
  const [activeInterventions, setActiveInterventions] = useState<string[]>([]);

  // Simulated distraction detection
  useEffect(() => {
    if (!isSessionActive) return;

    const interval = setInterval(() => {
      // Simulate random distractions during active sessions
      if (Math.random() < 0.1) { // 10% chance per interval
        const distractionTypes = ["notification", "interruption", "internal", "environmental"] as const;
        const sources = {
          notification: ["Email", "Slack", "Phone", "Social Media"],
          interruption: ["Colleague", "Phone Call", "Visitor", "Meeting"],
          internal: ["Wandering thoughts", "Hunger", "Fatigue", "Boredom"],
          environmental: ["Noise", "Temperature", "Lighting", "Movement"]
        };

        const type = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
        const source = sources[type][Math.floor(Math.random() * sources[type].length)];

        const distraction: Distraction = {
          id: `distraction-${Date.now()}`,
          type,
          source,
          timestamp: new Date(),
          duration: Math.floor(Math.random() * 120) + 10, // 10-130 seconds
          handled: false
        };

        setDistractions(prev => [...prev, distraction]);
        onDistractionLogged(distraction);

        // Reduce focus score
        setFocusScore(prev => Math.max(0, prev - Math.floor(Math.random() * 15) - 5));
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isSessionActive, onDistractionLogged]);

  const handleDistraction = (distractionId: string, intervention: string) => {
    setDistractions(prev => 
      prev.map(d => 
        d.id === distractionId 
          ? { ...d, handled: true }
          : d
      )
    );

    setActiveInterventions(prev => [...prev, intervention]);

    // Recover some focus score
    setFocusScore(prev => Math.min(100, prev + 10));

    // Remove intervention after some time
    setTimeout(() => {
      setActiveInterventions(prev => prev.filter(i => i !== intervention));
    }, 5000);
  };

  const getDistractionColor = (type: Distraction["type"]) => {
    switch (type) {
      case "notification": return "bg-blue-100 text-blue-800";
      case "interruption": return "bg-red-100 text-red-800";
      case "internal": return "bg-yellow-100 text-yellow-800";
      case "environmental": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getInterventionSuggestions = (distraction: Distraction): string[] => {
    switch (distraction.type) {
      case "notification":
        return ["Enable Do Not Disturb", "Close unnecessary apps", "Use website blocker"];
      case "interruption":
        return ["Signal busy status", "Reschedule if possible", "Set boundaries"];
      case "internal":
        return ["Take a deep breath", "Acknowledge and refocus", "Brief stretching"];
      case "environmental":
        return ["Adjust lighting", "Use noise-canceling", "Change location"];
      default:
        return ["Pause and refocus"];
    }
  };

  const unhandledDistractions = distractions.filter(d => !d.handled);
  const recentDistractions = distractions.slice(-5);

  return (
    <div className="space-y-4">
      {/* Focus Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-purple-600" />
            Focus Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">{focusScore}%</span>
              <Badge variant={focusScore > 80 ? "default" : focusScore > 60 ? "secondary" : "destructive"}>
                {focusScore > 80 ? "Excellent" : focusScore > 60 ? "Good" : "Needs Attention"}
              </Badge>
            </div>
            <Progress value={focusScore} className="h-2" />
            <p className="text-sm text-gray-600">
              {distractions.length} distractions detected this session
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Distractions */}
      {unhandledDistractions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Active Distractions ({unhandledDistractions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unhandledDistractions.map((distraction) => (
              <Alert key={distraction.id} className="p-3">
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getDistractionColor(distraction.type)}>
                          {distraction.type}
                        </Badge>
                        <span className="font-medium">{distraction.source}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {distraction.duration}s impact • {distraction.timestamp.toLocaleTimeString()}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {getInterventionSuggestions(distraction).map((suggestion, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleDistraction(distraction.id, suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Protection Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Distraction Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Intelligent Notification Blocking</span>
            </div>
            <Switch 
              checked={notificationBlocking}
              onCheckedChange={setNotificationBlocking}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>Environment Optimization</span>
            </div>
            <Switch 
              checked={environmentOptimization}
              onCheckedChange={setEnvironmentOptimization}
            />
          </div>

          {(notificationBlocking || environmentOptimization) && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-2">Active Protections:</p>
              <div className="space-y-1">
                {notificationBlocking && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Notifications blocked during focus time
                  </div>
                )}
                {environmentOptimization && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Environment suggestions active
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentDistractions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentDistractions.reverse().map((distraction) => (
                <div 
                  key={distraction.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Badge size="sm" className={getDistractionColor(distraction.type)}>
                      {distraction.type}
                    </Badge>
                    <span className="text-sm">{distraction.source}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{distraction.duration}s</span>
                    {distraction.handled && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Interventions */}
      {activeInterventions.length > 0 && (
        <div className="flex gap-2">
          {activeInterventions.map((intervention, index) => (
            <Badge key={index} variant="outline" className="animate-pulse">
              {intervention}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};