import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInsights } from "./AIInsights";
import { RealtimeInsights } from "./RealtimeInsights";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Brain, 
  Zap, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle
} from "lucide-react";
import { 
  ProductivityTrend, 
  BehaviorPattern, 
  PeakPerformanceAnalysis,
  GoalProgress,
  ProductivityForecast,
  WorkLifeBalance,
  HabitFormation
} from "@/types/Analytics";

interface ProductivityDashboardProps {
  timeRange: "week" | "month" | "quarter";
  onTimeRangeChange: (range: "week" | "month" | "quarter") => void;
}

export const ProductivityDashboard = ({ timeRange, onTimeRangeChange }: ProductivityDashboardProps) => {
  // Simulated data - in real app this would come from API
  const [productivityTrends, setProductivityTrends] = useState<ProductivityTrend[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [peakPerformance, setPeakPerformance] = useState<PeakPerformanceAnalysis | null>(null);
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [forecast, setForecast] = useState<ProductivityForecast[]>([]);
  const [workLifeBalance, setWorkLifeBalance] = useState<WorkLifeBalance | null>(null);
  const [habits, setHabits] = useState<HabitFormation[]>([]);

  useEffect(() => {
    // Generate sample data based on time range
    generateSampleData();
  }, [timeRange]);

  const generateSampleData = () => {
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;
    
    // Generate productivity trends
    const trends: ProductivityTrend[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.push({
        date,
        focusTime: Math.floor(Math.random() * 240) + 120, // 2-6 hours
        tasksCompleted: Math.floor(Math.random() * 10) + 3,
        focusQuality: Math.floor(Math.random() * 3) + 3, // 3-5
        energyLevel: Math.floor(Math.random() * 3) + 3,
        productivityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        contextSwitches: Math.floor(Math.random() * 20) + 5,
        distractionsCount: Math.floor(Math.random() * 15) + 2,
        goalProgress: Math.floor(Math.random() * 30) + 70
      });
    }
    setProductivityTrends(trends);

    // Generate behavior patterns
    setBehaviorPatterns([
      {
        id: "morning-peak",
        type: "peak-performance",
        name: "Morning Peak Performance",
        description: "Highest productivity between 9-11 AM",
        frequency: "daily",
        strength: 0.87,
        triggers: ["coffee", "quiet environment", "clear goals"],
        outcomes: ["higher focus quality", "faster task completion"],
        recommendations: ["Schedule complex tasks in morning", "Protect morning time blocks"],
        firstDetected: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastSeen: new Date()
      },
      {
        id: "afternoon-dip",
        type: "energy-cycle",
        name: "Post-Lunch Energy Dip",
        description: "Reduced energy and focus 1-3 PM",
        frequency: "daily",
        strength: 0.73,
        triggers: ["heavy lunch", "lack of movement", "monotonous tasks"],
        outcomes: ["increased distractions", "lower quality work"],
        recommendations: ["Light lunch", "Take walking break", "Schedule routine tasks"],
        firstDetected: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastSeen: new Date()
      },
      {
        id: "friday-procrastination",
        type: "procrastination",
        name: "Friday Afternoon Avoidance",
        description: "Tendency to avoid complex tasks on Friday afternoons",
        frequency: "weekly",
        strength: 0.65,
        triggers: ["weekend anticipation", "fatigue", "social distractions"],
        outcomes: ["delayed deadlines", "rushed Monday work"],
        recommendations: ["Front-load Friday schedule", "Batch simple tasks", "Set weekend boundaries"],
        firstDetected: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Generate peak performance analysis
    setPeakPerformance({
      optimalWorkHours: [
        { start: 9, end: 11 },
        { start: 14, end: 16 },
        { start: 19, end: 21 }
      ],
      bestTaskTypes: {
        9: ["creative", "analytical"],
        10: ["creative", "complex"],
        11: ["planning", "strategic"],
        14: ["administrative", "communication"],
        15: ["learning", "review"],
        16: ["collaboration", "meetings"],
        19: ["creative", "learning"],
        20: ["planning", "reflection"]
      },
      energyPeaks: [
        { hour: 9, energyLevel: 4.2 },
        { hour: 10, energyLevel: 4.8 },
        { hour: 11, energyLevel: 4.5 },
        { hour: 14, energyLevel: 3.8 },
        { hour: 15, energyLevel: 4.1 },
        { hour: 16, energyLevel: 3.9 },
        { hour: 19, energyLevel: 4.0 },
        { hour: 20, energyLevel: 3.7 }
      ],
      focusQualityByHour: [
        { hour: 9, quality: 4.3 },
        { hour: 10, quality: 4.7 },
        { hour: 11, quality: 4.4 },
        { hour: 14, quality: 3.6 },
        { hour: 15, quality: 3.9 },
        { hour: 16, quality: 3.8 },
        { hour: 19, quality: 4.1 },
        { hour: 20, quality: 3.8 }
      ],
      productivityFactors: [
        { factor: "Morning routine completed", impact: 0.35, confidence: 0.89, examples: ["meditation", "exercise", "healthy breakfast"] },
        { factor: "Clear daily goals set", impact: 0.28, confidence: 0.82, examples: ["written priorities", "time blocks", "success metrics"] },
        { factor: "Quiet environment", impact: 0.22, confidence: 0.76, examples: ["home office", "library", "early hours"] },
        { factor: "Adequate sleep (7+ hours)", impact: 0.31, confidence: 0.91, examples: ["consistent bedtime", "sleep tracking", "sleep hygiene"] },
        { factor: "Regular breaks", impact: 0.19, confidence: 0.74, examples: ["pomodoro breaks", "walking", "stretching"] }
      ]
    });

    // Generate goals
    setGoals([
      {
        goalId: "focus-time",
        title: "Daily Focus Time",
        targetValue: 240, // 4 hours
        currentValue: 189,
        unit: "minutes",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: "focus",
        trend: "improving",
        predictedCompletion: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        milestones: [
          { id: "m1", title: "2 hours daily", targetValue: 120, achievedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), isCompleted: true },
          { id: "m2", title: "3 hours daily", targetValue: 180, achievedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), isCompleted: true },
          { id: "m3", title: "4 hours daily", targetValue: 240, isCompleted: false }
        ]
      },
      {
        goalId: "task-completion",
        title: "Weekly Task Completion",
        targetValue: 50,
        currentValue: 38,
        unit: "tasks",
        category: "productivity",
        trend: "stable",
        milestones: [
          { id: "m1", title: "30 tasks weekly", targetValue: 30, achievedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), isCompleted: true },
          { id: "m2", title: "40 tasks weekly", targetValue: 40, isCompleted: false },
          { id: "m3", title: "50 tasks weekly", targetValue: 50, isCompleted: false }
        ]
      }
    ]);

    // Generate work-life balance
    setWorkLifeBalance({
      workHours: 45,
      personalHours: 28,
      focusedWork: 32,
      breakTime: 8,
      overTimeHours: 5,
      wellnessScore: 78,
      burnoutRisk: "medium",
      recommendations: [
        "Reduce overtime by 2 hours this week",
        "Schedule more breaks during focused work",
        "Protect personal time boundaries",
        "Consider delegation for non-critical tasks"
      ]
    });

    // Generate habits
    setHabits([
      {
        habitId: "morning-routine",
        name: "Morning Planning Routine",
        category: "productivity",
        targetFrequency: 7,
        currentStreak: 12,
        longestStreak: 18,
        completionRate: 0.86,
        difficulty: 2,
        triggers: ["wake up", "coffee ready", "quiet time"],
        barriers: ["late nights", "busy mornings", "travel"],
        rewards: ["clarity", "better focus", "reduced anxiety"],
        formationStage: "established"
      },
      {
        habitId: "deep-work-blocks",
        name: "2-Hour Deep Work Blocks",
        category: "focus",
        targetFrequency: 5,
        currentStreak: 8,
        longestStreak: 15,
        completionRate: 0.74,
        difficulty: 4,
        triggers: ["morning energy", "clear goals", "distraction-free zone"],
        barriers: ["meetings", "interruptions", "lack of preparation"],
        rewards: ["significant progress", "flow state", "accomplishment"],
        formationStage: "developing"
      }
    ]);
  };

  const getProductivityTrend = () => {
    if (productivityTrends.length < 2) return "stable";
    const recent = productivityTrends.slice(-7);
    const earlier = productivityTrends.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, t) => sum + t.productivityScore, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, t) => sum + t.productivityScore, 0) / earlier.length;
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (change > 5) return "improving";
    if (change < -5) return "declining";
    return "stable";
  };

  const averageProductivity = productivityTrends.length > 0 
    ? Math.round(productivityTrends.reduce((sum, t) => sum + t.productivityScore, 0) / productivityTrends.length)
    : 0;

  const totalFocusTime = productivityTrends.reduce((sum, t) => sum + t.focusTime, 0);
  const totalTasksCompleted = productivityTrends.reduce((sum, t) => sum + t.tasksCompleted, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Productivity Score</p>
                <p className="text-2xl font-bold text-purple-600">{averageProductivity}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <Badge variant={getProductivityTrend() === "improving" ? "default" : 
                          getProductivityTrend() === "declining" ? "destructive" : "secondary"}>
              {getProductivityTrend()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Focus Time</p>
                <p className="text-2xl font-bold text-blue-600">{Math.round(totalFocusTime / 60)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">
              {Math.round(totalFocusTime / productivityTrends.length / 60)}h avg/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-green-600">{totalTasksCompleted}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">
              {Math.round(totalTasksCompleted / productivityTrends.length)} avg/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patterns Found</p>
                <p className="text-2xl font-bold text-orange-600">{behaviorPatterns.length}</p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500">
              AI insights available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="realtime">Live</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <RealtimeInsights />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <AIInsights />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Productivity Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productivityTrends.slice(-7).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{trend.date.toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">
                        {Math.round(trend.focusTime / 60)}h focus • {trend.tasksCompleted} tasks
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{trend.productivityScore}%</p>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span className="text-xs">{trend.energyLevel}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {behaviorPatterns.map((pattern) => (
            <Card key={pattern.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {pattern.name}
                  </span>
                  <Badge variant="outline">
                    {Math.round(pattern.strength * 100)}% confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{pattern.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Triggers</h4>
                    <div className="space-y-1">
                      {pattern.triggers.map((trigger, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Outcomes</h4>
                    <div className="space-y-1">
                      {pattern.outcomes.map((outcome, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {outcome}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-purple-700 mb-2">Recommendations</h4>
                    <div className="space-y-1">
                      {pattern.recommendations.map((rec, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {peakPerformance && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Peak Performance Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {peakPerformance.optimalWorkHours.map((period, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg text-center">
                        <p className="font-medium text-green-800">
                          {period.start}:00 - {period.end}:00
                        </p>
                        <p className="text-sm text-green-600">Optimal for deep work</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Productivity Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {peakPerformance.productivityFactors.map((factor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{factor.factor}</span>
                          <Badge variant="outline">
                            +{Math.round(factor.impact * 100)}% impact
                          </Badge>
                        </div>
                        <Progress value={factor.impact * 100} className="h-2" />
                        <p className="text-sm text-gray-600">
                          {factor.confidence * 100}% confidence • Examples: {factor.examples.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.goalId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {goal.title}
                  </span>
                  <Badge variant={goal.trend === "improving" ? "default" : 
                               goal.trend === "declining" ? "destructive" : "secondary"}>
                    {goal.trend}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span className="text-lg font-medium text-purple-600">
                        {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                      </span>
                    </div>
                    <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-3" />
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className={milestone.isCompleted ? "line-through text-gray-500" : ""}>
                            {milestone.title}
                          </span>
                          {milestone.isCompleted ? (
                            <Badge variant="default">Completed</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {goal.predictedCompletion && (
                    <p className="text-sm text-gray-600">
                      Predicted completion: {goal.predictedCompletion.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          {workLifeBalance && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Work-Life Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{workLifeBalance.workHours}h</p>
                      <p className="text-sm text-blue-700">Work Hours</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{workLifeBalance.personalHours}h</p>
                      <p className="text-sm text-green-700">Personal Time</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Wellness Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={workLifeBalance.wellnessScore} className="w-24 h-2" />
                        <span className="font-bold">{workLifeBalance.wellnessScore}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Burnout Risk</span>
                      <Badge variant={workLifeBalance.burnoutRisk === "low" ? "default" : 
                                   workLifeBalance.burnoutRisk === "medium" ? "secondary" : "destructive"}>
                        {workLifeBalance.burnoutRisk}
                      </Badge>
                    </div>
                  </div>

                  {workLifeBalance.overTimeHours > 0 && (
                    <div className="p-3 bg-orange-50 rounded-lg mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">
                          {workLifeBalance.overTimeHours}h overtime this week
                        </span>
                      </div>
                      <p className="text-sm text-orange-700">
                        Consider reducing workload to maintain balance
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workLifeBalance.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Habit Formation Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {habits.map((habit) => (
                      <div key={habit.habitId} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{habit.name}</h4>
                          <Badge variant="outline">{habit.formationStage}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Current Streak</p>
                            <p className="font-bold text-green-600">{habit.currentStreak} days</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Completion Rate</p>
                            <p className="font-bold text-blue-600">
                              {Math.round(habit.completionRate * 100)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Difficulty</p>
                            <p className="font-bold text-purple-600">{habit.difficulty}/5</p>
                          </div>
                        </div>

                        <Progress value={habit.completionRate * 100} className="mt-3 h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};