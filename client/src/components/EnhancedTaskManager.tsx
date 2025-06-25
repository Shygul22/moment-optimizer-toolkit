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

interface EnhancedTaskManagerProps {
  onTasksUpdate?: (tasks: Task[]) => void;
}

export const EnhancedTaskManager = ({ onTasksUpdate }: EnhancedTaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [context, setContext] = useState<Task['context']>("work");
  const [impact, setImpact] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [complexity, setComplexity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [energyLevel, setEnergyLevel] = useState<Task['energyLevel']>("medium");
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30);
  const { toast } = useToast();

  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    onTasksUpdate?.(newTasks);
  };

  // Smart defaults based on task content analysis
  const getSmartDefaults = (taskTitle: string) => {
    const title = taskTitle.toLowerCase();
    
    // Determine context based on keywords
    let context: Task['context'] = "work";
    if (title.includes("buy") || title.includes("grocery") || title.includes("personal") || title.includes("family")) {
      context = "personal";
    } else if (title.includes("learn") || title.includes("study") || title.includes("course") || title.includes("read")) {
      context = "learning";
    } else if (title.includes("creative") || title.includes("design") || title.includes("write") || title.includes("brainstorm")) {
      context = "creative";
    } else if (title.includes("admin") || title.includes("paperwork") || title.includes("form") || title.includes("email")) {
      context = "administrative";
    }
    
    // Determine priority based on urgency words
    let priority: "high" | "medium" | "low" = "medium";
    if (title.includes("urgent") || title.includes("asap") || title.includes("deadline") || title.includes("important")) {
      priority = "high";
    } else if (title.includes("later") || title.includes("sometime") || title.includes("maybe")) {
      priority = "low";
    }
    
    // Estimate duration based on task type
    let estimatedDuration = 30;
    if (title.includes("quick") || title.includes("brief") || title.includes("check")) {
      estimatedDuration = 15;
    } else if (title.includes("meeting") || title.includes("call")) {
      estimatedDuration = 60;
    } else if (title.includes("project") || title.includes("develop") || title.includes("create")) {
      estimatedDuration = 120;
    }
    
    // Determine complexity
    let complexity: 1 | 2 | 3 | 4 | 5 = 3;
    if (title.includes("simple") || title.includes("easy") || title.includes("quick")) {
      complexity = 2;
    } else if (title.includes("complex") || title.includes("difficult") || title.includes("project")) {
      complexity = 4;
    }
    
    // Determine impact
    let impact: 1 | 2 | 3 | 4 | 5 = 3;
    if (title.includes("critical") || title.includes("important") || title.includes("key")) {
      impact = 4;
    } else if (title.includes("minor") || title.includes("small")) {
      impact = 2;
    }
    
    // Determine energy level
    let energyLevel: "low" | "medium" | "high" = "medium";
    if (title.includes("creative") || title.includes("brainstorm") || title.includes("planning")) {
      energyLevel = "high";
    } else if (title.includes("admin") || title.includes("email") || title.includes("organize")) {
      energyLevel = "low";
    }
    
    return { context, priority, estimatedDuration, complexity, impact, energyLevel };
  };

  const addTask = () => {
    if (!newTask.trim()) return;

    // Smart defaults based on task content
    const smartDefaults = getSmartDefaults(newTask.trim());
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      priority: showAdvanced ? priority : smartDefaults.priority,
      completed: false,
      createdAt: new Date(),
      complexity: showAdvanced ? complexity : smartDefaults.complexity,
      impact: showAdvanced ? impact : smartDefaults.impact,
      context: showAdvanced ? context : smartDefaults.context,
      energyLevel: showAdvanced ? energyLevel : smartDefaults.energyLevel,
      estimatedDuration: showAdvanced ? estimatedDuration : smartDefaults.estimatedDuration,
    };

    // Calculate AI priority score
    task.aiScore = AITaskPrioritizer.calculatePriorityScore(task);

    const newTasks = [task, ...tasks];
    updateTasks(newTasks);
    setNewTask("");
    
    // Reset to defaults only if not using advanced mode
    if (!showAdvanced) {
      setPriority("medium");
      setContext("work");
      setEnergyLevel("medium");
      setImpact(3);
      setComplexity(3);
      setEstimatedDuration(30);
    }
    
    toast({
      title: "Task added",
      description: showAdvanced 
        ? `Task created with AI score: ${task.aiScore?.toFixed(1)}`
        : `AI automatically set ${smartDefaults.context} context, ${smartDefaults.priority} priority`,
    });
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateTasks(newTasks);
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(task => task.id !== id);
    updateTasks(newTasks);
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
            Add Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="What do you need to do?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTask()}
                className="text-lg flex-1"
              />
              <Button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-700 px-6">
                <Plus size={18} className="mr-2" />
                Add
              </Button>
            </div>
            
            {/* Optional: Show advanced options toggle */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>AI will automatically set priority, complexity, and context</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs"
              >
                {showAdvanced ? "Hide" : "Show"} Options
              </Button>
            </div>
            
            {/* Advanced options - collapsed by default */}
            {showAdvanced && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
            )}
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
