import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Target,
  Activity
} from "lucide-react";
import { BehaviorPattern, ContextSwitchAnalysis, ProcastinationAnalysis } from "@/types/Analytics";

interface BehaviorInsightsProps {
  patterns: BehaviorPattern[];
  contextSwitching: ContextSwitchAnalysis;
  procrastination: ProcastinationAnalysis;
}

export const BehaviorInsights = ({ 
  patterns, 
  contextSwitching, 
  procrastination 
}: BehaviorInsightsProps) => {
  const getPatternColor = (type: BehaviorPattern["type"]) => {
    switch (type) {
      case "peak-performance": return "text-green-600 bg-green-50";
      case "energy-cycle": return "text-blue-600 bg-blue-50";
      case "procrastination": return "text-red-600 bg-red-50";
      case "work-pattern": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getPatternIcon = (type: BehaviorPattern["type"]) => {
    switch (type) {
      case "peak-performance": return <TrendingUp className="h-4 w-4" />;
      case "energy-cycle": return <Zap className="h-4 w-4" />;
      case "procrastination": return <AlertTriangle className="h-4 w-4" />;
      case "work-pattern": return <Activity className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getRiskLevel = (score: number) => {
    if (score > 70) return { level: "high", color: "text-red-600 bg-red-50" };
    if (score > 40) return { level: "medium", color: "text-yellow-600 bg-yellow-50" };
    return { level: "low", color: "text-green-600 bg-green-50" };
  };

  const procrastinationRisk = getRiskLevel(procrastination.procrastinationScore);
  const switchingEfficiency = 100 - Math.min(100, contextSwitching.costOfSwitching * 2);

  return (
    <div className="space-y-6">
      {/* Behavior Patterns Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patterns Detected</p>
                <p className="text-2xl font-bold text-purple-600">{patterns.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {patterns.filter(p => p.strength > 0.7).length} strong patterns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Context Switches</p>
                <p className="text-2xl font-bold text-blue-600">{contextSwitching.switchesPerHour}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              per hour average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Procrastination Risk</p>
                <p className={`text-2xl font-bold ${procrastinationRisk.color.split(' ')[0]}`}>
                  {procrastination.procrastinationScore}%
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${procrastinationRisk.color.split(' ')[0]}`} />
            </div>
            <Badge variant="outline" className={procrastinationRisk.color}>
              {procrastinationRisk.level} risk
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detected Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Behavioral Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patterns.map((pattern) => (
            <Card key={pattern.id} className={getPatternColor(pattern.type)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPatternIcon(pattern.type)}
                    <h4 className="font-medium">{pattern.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(pattern.strength * 100)}% confidence
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {pattern.frequency}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm mb-3 opacity-80">{pattern.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <h5 className="font-medium mb-1 opacity-90">Triggers</h5>
                    <div className="space-y-1">
                      {pattern.triggers.slice(0, 3).map((trigger, i) => (
                        <Badge key={i} variant="outline" className="text-xs mr-1">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-1 opacity-90">Outcomes</h5>
                    <div className="space-y-1">
                      {pattern.outcomes.slice(0, 3).map((outcome, i) => (
                        <Badge key={i} variant="outline" className="text-xs mr-1">
                          {outcome}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-1 opacity-90">Recommendations</h5>
                    <div className="space-y-1">
                      {pattern.recommendations.slice(0, 2).map((rec, i) => (
                        <Badge key={i} variant="outline" className="text-xs mr-1">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Progress value={pattern.strength * 100} className="mt-3 h-1" />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Context Switching Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Context Switching Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Switching Efficiency</span>
                  <span className="text-lg font-bold text-blue-600">{Math.round(switchingEfficiency)}%</span>
                </div>
                <Progress value={switchingEfficiency} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  {contextSwitching.costOfSwitching} minutes lost per switch
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Focus Block</span>
                  <span className="text-lg font-bold text-green-600">
                    {Math.round(contextSwitching.averageFocusBlockDuration)} min
                  </span>
                </div>
                <Progress value={(contextSwitching.averageFocusBlockDuration / 90) * 100} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  Optimal range: 45-90 minutes
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Common Switch Patterns</h4>
              {contextSwitching.mostCommonSwitches.slice(0, 4).map((switchPattern, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">
                    {switchPattern.from} → {switchPattern.to}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {switchPattern.frequency}x
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {contextSwitching.switchesPerHour > 8 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High context switching detected. Consider time blocking and notification management to improve focus.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Procrastination Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Procrastination Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${procrastinationRisk.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Risk Assessment</span>
                </div>
                <p className="text-2xl font-bold mb-1">{procrastination.procrastinationScore}%</p>
                <p className="text-sm opacity-80">
                  {procrastinationRisk.level === "high" ? "High risk - immediate intervention recommended" :
                   procrastinationRisk.level === "medium" ? "Moderate risk - monitor and improve habits" :
                   "Low risk - maintain current practices"}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-3">Common Triggers</h4>
                <div className="space-y-2">
                  {procrastination.commonTriggers.map((trigger, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded text-sm">
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                      {trigger}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Avoidance Patterns</h4>
                <div className="space-y-2">
                  {procrastination.avoidedTaskTypes.map((taskType, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm">{taskType}</span>
                      <Badge variant="outline" className="text-xs">
                        Often avoided
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Successful Strategies</h4>
                <div className="space-y-2">
                  {procrastination.successfulOvercomes.map((strategy, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">{strategy.strategy}</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-xs">{strategy.effectiveness}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Recommended Interventions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {procrastination.interventionStrategies.map((strategy, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded text-sm">
                  <Target className="h-3 w-3 text-blue-600" />
                  {strategy}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};