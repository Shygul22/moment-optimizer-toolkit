
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, Clock, CheckSquare, Brain, Zap, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/Task";
import { AITaskPrioritizer } from "@/utils/aiPrioritization";
import { SmartTaskSuggestions } from "./SmartTaskSuggestions";

export const EnhancedTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [context, setContext] = useState<Task['context']>("work");
  const [impact, setImpact] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [complexity, setComplexity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [energyLevel, setEnergyLevel] = useState<Task['energyLevel']>("medium");
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30);
  const { toast } = useToast();

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      priority,
      completed: false,
      createdAt: new Date(),
      complexity,
      impact,
      context,
      energyLevel,
      estimatedDuration,
    };

    // Calculate AI priority score
    task.aiScore = AITaskPrioritizer.calculatePriorityScore(task);

    setTasks([task, ...tasks]);
    setNewTask("");
    toast({
      title: "Smart task added",
      description: `Task prioritized with AI score: ${task.aiScore?.toFixed(1)}`,
    });
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleSuggestionSelect = (task: Task) => {
    toast({
      title: "AI Recommendation Selected",
      description: `Starting "${task.title}" - optimal for current time!`,
    });
    // You can integrate this with the time tracker here
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

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

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  // Sort tasks by AI score for display
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return (b.aiScore || 0) - (a.aiScore || 0);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* AI Suggestions */}
      <SmartTaskSuggestions tasks={tasks} onSelectTask={handleSuggestionSelect} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Optimized</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {tasks.filter(t => t.aiScore && t.aiScore > 7).length}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Add Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Add Smart Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Enter your task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="text-lg"
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                <Select value={priority} onValueChange={(value: "high" | "medium" | "low") => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Context</label>
                <Select value={context} onValueChange={(value: Task['context']) => setContext(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Energy Level</label>
                <Select value={energyLevel} onValueChange={(value: Task['energyLevel']) => setEnergyLevel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Energy</SelectItem>
                    <SelectItem value="medium">Medium Energy</SelectItem>
                    <SelectItem value="high">High Energy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Impact (1-5)</label>
                <Select value={impact.toString()} onValueChange={(value) => setImpact(parseInt(value) as 1 | 2 | 3 | 4 | 5)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Low Impact</SelectItem>
                    <SelectItem value="2">2 - Minor Impact</SelectItem>
                    <SelectItem value="3">3 - Moderate Impact</SelectItem>
                    <SelectItem value="4">4 - High Impact</SelectItem>
                    <SelectItem value="5">5 - Critical Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Complexity (1-5)</label>
                <Select value={complexity.toString()} onValueChange={(value) => setComplexity(parseInt(value) as 1 | 2 | 3 | 4 | 5)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Simple</SelectItem>
                    <SelectItem value="2">2 - Simple</SelectItem>
                    <SelectItem value="3">3 - Moderate</SelectItem>
                    <SelectItem value="4">4 - Complex</SelectItem>
                    <SelectItem value="5">5 - Very Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Duration (min)</label>
                <Input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 30)}
                  min="5"
                  max="480"
                />
              </div>
            </div>
            
            <Button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-700 w-full">
              <Plus size={18} className="mr-2" />
              Add Smart Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Task List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Your Tasks
            <Badge variant="secondary" className="ml-2">
              AI Sorted
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tasks yet. Add one above to get AI-powered recommendations!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                    task.completed
                      ? "bg-gray-50 border-gray-200 opacity-75"
                      : "bg-white border-gray-200 hover:shadow-md"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 hover:border-green-500"
                    }`}
                  >
                    {task.completed && <Check size={12} className="text-white" />}
                  </button>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getContextColor(task.context)}>
                        {task.context}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {task.impact}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {task.energyLevel}
                      </Badge>
                      {task.estimatedDuration && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedDuration}min
                        </Badge>
                      )}
                      {task.aiScore && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                          AI: {task.aiScore.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
