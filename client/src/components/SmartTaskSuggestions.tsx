
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Clock, Zap, Target } from "lucide-react";
import { Task } from "@shared/schema";

interface SmartTaskSuggestionsProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const SmartTaskSuggestions = ({ tasks, onSelectTask }: SmartTaskSuggestionsProps) => {
  // Simple prioritization - show high priority incomplete tasks
  const suggestions = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 3);
  
  const currentHour = new Date().getHours();
  const recommendedEnergy = currentHour >= 9 && currentHour <= 11 ? 'high' : 
                           currentHour >= 14 && currentHour <= 16 ? 'medium' : 'low';

  const getContextColor = (context: Task['context']) => {
    const colors = {
      work: "bg-blue-100 text-blue-700",
      personal: "bg-green-100 text-green-700",
      creative: "bg-purple-100 text-purple-700",
      administrative: "bg-gray-100 text-gray-700",
      learning: "bg-orange-100 text-orange-700"
    };
    return colors[context];
  };

  const getEnergyIcon = (energy: Task['energyLevel']) => {
    if (energy === 'high') return <Zap className="w-4 h-4 text-red-500" />;
    if (energy === 'medium') return <Zap className="w-4 h-4 text-yellow-500" />;
    return <Zap className="w-4 h-4 text-green-500" />;
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700">
          <Brain className="w-5 h-5" />
          AI Recommendations
          <Badge variant="secondary" className="ml-2">
            Optimal for {recommendedEnergy} energy
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((task, index) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-indigo-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                  <p className="font-medium text-gray-800">{task.title}</p>
                  {getEnergyIcon(task.energyLevel)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge className={getContextColor(task.context)}>
                    {task.context}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Impact: {task.impact}/5
                  </Badge>
                  {task.estimatedDuration && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.estimatedDuration}min
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                    Priority: {task.priority}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => onSelectTask(task)}
                className="bg-indigo-600 hover:bg-indigo-700"
                size="sm"
              >
                Start Now
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
