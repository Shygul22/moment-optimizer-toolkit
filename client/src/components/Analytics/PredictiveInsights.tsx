import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crystal, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Target,
  Brain,
  Lightbulb,
  Clock,
  Star
} from "lucide-react";
import { ProductivityForecast, GoalProgress, HabitFormation } from "@/types/Analytics";

interface PredictiveInsightsProps {
  forecasts: ProductivityForecast[];
  goals: GoalProgress[];
  habits: HabitFormation[];
}

export const PredictiveInsights = ({ forecasts, goals, habits }: PredictiveInsightsProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "quarter">("week");

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return "text-green-600 bg-green-50";
    if (confidence > 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining": return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getHabitStageColor = (stage: HabitFormation["formationStage"]) => {
    switch (stage) {
      case "automatic": return "text-green-600 bg-green-50";
      case "established": return "text-blue-600 bg-blue-50";
      case "developing": return "text-yellow-600 bg-yellow-50";
      case "forming": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getHabitStageProgress = (stage: HabitFormation["formationStage"]) => {
    switch (stage) {
      case "forming": return 25;
      case "developing": return 50;
      case "established": return 75;
      case "automatic": return 100;
      default: return 0;
    }
  };

  const upcomingForecasts = forecasts.filter(f => f.date > new Date()).slice(0, 7);
  const activeGoals = goals.filter(g => (g.currentValue / g.targetValue) < 1);
  const developingHabits = habits.filter(h => h.formationStage !== "automatic");

  return (
    <div className="space-y-6">
      {/* Forecast Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Week Prediction</p>
                <p className="text-2xl font-bold text-purple-600">
                  {upcomingForecasts.length > 0 ? Math.round(upcomingForecasts[0].predictedProductivity) : "--"}%
                </p>
              </div>
              <Crystal className="h-8 w-8 text-purple-600" />
            </div>
            {upcomingForecasts.length > 0 && (
              <Badge variant="outline" className={getConfidenceColor(upcomingForecasts[0].confidence)}>
                {Math.round(upcomingForecasts[0].confidence * 100)}% confidence
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold text-blue-600">{activeGoals.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {goals.filter(g => g.trend === "improving").length} improving
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Habits in Formation</p>
                <p className="text-2xl font-bold text-green-600">{developingHabits.length}</p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {habits.filter(h => h.formationStage === "established").length} established
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="quarter">This Quarter</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTimeframe} className="space-y-6">
          {/* Productivity Forecasts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crystal className="h-5 w-5" />
                Productivity Forecasts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingForecasts.slice(0, 5).map((forecast, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{forecast.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-purple-600">
                            {forecast.predictedProductivity}%
                          </span>
                          <Badge variant="outline" className={getConfidenceColor(forecast.confidence)}>
                            {Math.round(forecast.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <Progress value={forecast.predictedProductivity} className="w-24 h-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Positive Factors</h4>
                        <div className="space-y-1">
                          {forecast.factors.slice(0, 3).map((factor, i) => (
                            <div key={i} className="flex items-center gap-2 text-green-600">
                              <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                              {factor}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Risk Factors</h4>
                        <div className="space-y-1">
                          {forecast.riskFactors.slice(0, 3).map((risk, i) => (
                            <div key={i} className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              {risk}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {forecast.recommendations.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          AI Recommendations
                        </h4>
                        <div className="space-y-1">
                          {forecast.recommendations.slice(0, 2).map((rec, i) => (
                            <p key={i} className="text-sm text-blue-800">• {rec}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goal Progress Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Achievement Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <Card key={goal.goalId} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{goal.title}</h4>
                          {getTrendIcon(goal.trend)}
                          <Badge variant="outline">
                            {goal.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-lg font-bold">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                          <Badge variant={goal.trend === "improving" ? "default" : 
                                        goal.trend === "declining" ? "destructive" : "secondary"}>
                            {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                          </Badge>
                        </div>
                        <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm mb-2">Milestones</h5>
                        <div className="space-y-1">
                          {goal.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center justify-between text-sm">
                              <span className={milestone.isCompleted ? "line-through text-gray-500" : ""}>
                                {milestone.title}
                              </span>
                              {milestone.isCompleted ? (
                                <Badge size="sm" variant="default">✓</Badge>
                              ) : (
                                <Badge size="sm" variant="outline">Pending</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        {goal.predictedCompletion && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-900">Predicted Completion</span>
                            </div>
                            <p className="text-green-800">
                              {goal.predictedCompletion.toLocaleDateString()}
                            </p>
                            {goal.deadline && (
                              <p className="text-xs text-green-600 mt-1">
                                {goal.predictedCompletion <= goal.deadline ? "On track" : "Behind schedule"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Habit Formation Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Habit Formation Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {developingHabits.map((habit) => (
                  <Card key={habit.habitId} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{habit.name}</h4>
                          <Badge variant="outline" className={getHabitStageColor(habit.formationStage)}>
                            {habit.formationStage}
                          </Badge>
                        </div>
                        <Progress value={getHabitStageProgress(habit.formationStage)} className="h-2 mb-2" />
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium text-green-600">{habit.currentStreak}</p>
                            <p className="text-gray-600">Current Streak</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-blue-600">{Math.round(habit.completionRate * 100)}%</p>
                            <p className="text-gray-600">Completion Rate</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-purple-600">{habit.difficulty}/5</p>
                            <p className="text-gray-600">Difficulty</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Success Factors</h5>
                        <div className="space-y-1">
                          {habit.triggers.slice(0, 3).map((trigger, i) => (
                            <div key={i} className="flex items-center gap-2 text-green-600">
                              <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                              {trigger}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-red-700 mb-2">Barriers</h5>
                        <div className="space-y-1">
                          {habit.barriers.slice(0, 3).map((barrier, i) => (
                            <div key={i} className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              {barrier}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {habit.formationStage !== "automatic" && (
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900 mb-2">Formation Prediction</h5>
                        <p className="text-sm text-purple-800">
                          {habit.formationStage === "forming" && 
                            "Estimated 3-4 weeks to reach developing stage with current consistency"}
                          {habit.formationStage === "developing" && 
                            "Estimated 2-3 weeks to become established with sustained effort"}
                          {habit.formationStage === "established" && 
                            "Close to becoming automatic - maintain consistency for 1-2 more weeks"}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {developingHabits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>All habits are well-established!</p>
                  <p className="text-sm">Consider adding new productive habits to continue growing.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};