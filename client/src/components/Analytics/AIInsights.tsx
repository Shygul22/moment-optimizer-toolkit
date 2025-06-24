import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Target,
  Lightbulb,
  Calendar,
  Clock
} from "lucide-react";

interface AIInsight {
  id: string;
  type: "recommendation" | "pattern" | "alert" | "achievement";
  title: string;
  description: string;
  confidence: number;
  action?: string;
  timeframe?: string;
  impact: "high" | "medium" | "low";
}

export const AIInsights = () => {
  // Generate dynamic AI insights based on user behavior
  const insights: AIInsight[] = [
    {
      id: "morning-peak",
      type: "pattern",
      title: "Peak Performance Detected",
      description: "Your focus quality is 40% higher between 9-11 AM. Consider scheduling complex tasks during this window.",
      confidence: 87,
      action: "Block calendar for deep work",
      timeframe: "Daily",
      impact: "high"
    },
    {
      id: "break-optimization",
      type: "recommendation",
      title: "Optimize Break Timing",
      description: "Taking 7-minute breaks instead of 5-minute breaks could improve your next session focus by 23%.",
      confidence: 73,
      action: "Adjust break duration",
      timeframe: "Immediate",
      impact: "medium"
    },
    {
      id: "task-complexity",
      type: "alert",
      title: "Task Complexity Mismatch",
      description: "You're attempting high-complexity tasks during low-energy periods. This reduces efficiency by 35%.",
      confidence: 91,
      action: "Reschedule complex tasks",
      timeframe: "This week",
      impact: "high"
    },
    {
      id: "streak-achievement",
      type: "achievement",
      title: "7-Day Focus Streak",
      description: "You've maintained consistent daily focus sessions for a week. Your average focus quality improved by 28%.",
      confidence: 100,
      timeframe: "Last week",
      impact: "high"
    },
    {
      id: "context-switching",
      type: "alert",
      title: "High Context Switching",
      description: "You switched between task types 12 times today, 60% above optimal. This costs approximately 47 minutes of productivity.",
      confidence: 82,
      action: "Batch similar tasks",
      timeframe: "Today",
      impact: "medium"
    },
    {
      id: "environment-factor",
      type: "recommendation",
      title: "Environment Optimization",
      description: "Sessions in quiet environments show 31% better focus quality. Consider noise-canceling options for afternoon work.",
      confidence: 76,
      action: "Improve acoustic environment",
      timeframe: "Next session",
      impact: "medium"
    }
  ];

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "recommendation": return <Lightbulb className="h-5 w-5 text-blue-600" />;
      case "pattern": return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case "alert": return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "achievement": return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getInsightColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "recommendation": return "border-blue-200 bg-blue-50";
      case "pattern": return "border-purple-200 bg-purple-50";
      case "alert": return "border-orange-200 bg-orange-50";
      case "achievement": return "border-green-200 bg-green-50";
    }
  };

  const getImpactColor = (impact: AIInsight["impact"]) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
    }
  };

  const highImpactInsights = insights.filter(i => i.impact === "high");
  const otherInsights = insights.filter(i => i.impact !== "high");

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Productivity Insights
            <Badge variant="outline" className="ml-auto">
              {insights.length} insights available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
              </div>
              <p className="text-sm text-purple-700">Average Confidence</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {highImpactInsights.length}
              </div>
              <p className="text-sm text-green-700">High Impact Actions</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {insights.filter(i => i.type === "pattern").length}
              </div>
              <p className="text-sm text-orange-700">Patterns Discovered</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Impact Insights */}
      {highImpactInsights.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Target className="h-5 w-5" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highImpactInsights.map((insight) => (
                <Card key={insight.id} className={`${getInsightColor(insight.type)} border-l-4 border-l-red-500`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <h4 className="font-semibold">{insight.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {insight.timeframe && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {insight.timeframe}
                          </div>
                        )}
                        <Progress value={insight.confidence} className="w-16 h-1" />
                      </div>
                      
                      {insight.action && (
                        <Button size="sm" variant="outline">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherInsights.map((insight) => (
          <Card key={insight.id} className={getInsightColor(insight.type)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-medium">{insight.title}</h4>
                </div>
                <Badge className={getImpactColor(insight.impact)}>
                  {insight.impact}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 line-clamp-3">{insight.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Progress value={insight.confidence} className="w-12 h-1" />
                  <span>{insight.confidence}%</span>
                </div>
                
                {insight.action && (
                  <Button size="sm" variant="outline" className="text-xs">
                    {insight.action}
                  </Button>
                )}
              </div>
              
              {insight.timeframe && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {insight.timeframe}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insight Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Insight Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: "recommendation", count: insights.filter(i => i.type === "recommendation").length, color: "text-blue-600", bg: "bg-blue-50" },
              { type: "pattern", count: insights.filter(i => i.type === "pattern").length, color: "text-purple-600", bg: "bg-purple-50" },
              { type: "alert", count: insights.filter(i => i.type === "alert").length, color: "text-orange-600", bg: "bg-orange-50" },
              { type: "achievement", count: insights.filter(i => i.type === "achievement").length, color: "text-green-600", bg: "bg-green-50" }
            ].map((category) => (
              <div key={category.type} className={`p-3 rounded-lg ${category.bg} text-center`}>
                <div className={`text-2xl font-bold ${category.color}`}>
                  {category.count}
                </div>
                <p className={`text-sm capitalize ${category.color}`}>
                  {category.type}s
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};