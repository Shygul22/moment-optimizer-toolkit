import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, Clock, CheckSquare, Brain, Zap, Target, RefreshCw, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SmartTaskSuggestions } from "./SmartTaskSuggestions";

interface EnhancedTaskManagerProps {
  onTasksUpdate?: (tasks: Task[]) => void;
}

export const EnhancedTaskManager = ({ onTasksUpdate }: EnhancedTaskManagerProps) => {
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks from API
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest("/api/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTask("");
      setPriority("medium");
      setEstimatedDuration(30);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return await apiRequest(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/tasks/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  useEffect(() => {
    onTasksUpdate?.(tasks);
  }, [tasks, onTasksUpdate]);

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
    
    const taskData = {
      title: newTask.trim(),
      priority: priority,
      completed: false,
      complexity: smartDefaults.complexity,
      impact: smartDefaults.impact,
      context: smartDefaults.context,
      energyLevel: smartDefaults.energyLevel,
      estimatedDuration: estimatedDuration,
    };

    createTaskMutation.mutate(taskData);
    
    toast({
      title: "Task added",
      description: `AI set context: ${smartDefaults.context}, complexity: ${smartDefaults.complexity}/5`,
    });
  };

  const toggleTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTaskMutation.mutate({ 
        id, 
        updates: { completed: !task.completed } 
      });
    }
  };

  const handleDeleteTask = (id: number) => {
    deleteTaskMutation.mutate(id);
  };

  const handleSuggestionSelect = (task: Task) => {
    toast({
      title: "AI Recommendation Selected", 
      description: `Starting "${task.title}" - optimal for current time!`,
    });
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

  // Sort tasks by completion status and creation date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

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
            
            {/* AI information */}
            <div className="text-sm text-gray-500 text-center">
              AI will automatically set context and complexity based on your task description
            </div>
            
            {/* Simple manual controls - always visible */}
            <div className="grid grid-cols-2 gap-4">
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Duration (min)</label>
                <Input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 30)}
                  min="5"
                  max="480"
                  placeholder="30"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="outline"
          onClick={() => {
            const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high');
            if (highPriorityTasks.length > 0) {
              toast({
                title: "Focus Mode",
                description: `${highPriorityTasks.length} high priority tasks to tackle first`,
              });
            } else {
              toast({
                title: "All Clear!",
                description: "No high priority tasks pending",
              });
            }
          }}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Focus Mode
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            const completedToday = tasks.filter(t => 
              t.completed && 
              new Date(t.createdAt).toDateString() === new Date().toDateString()
            ).length;
            toast({
              title: "Today's Progress",
              description: `${completedToday} tasks completed today`,
            });
          }}
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Progress
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            const quickTasks = tasks.filter(t => !t.completed && (t.estimatedDuration || 0) <= 15);
            if (quickTasks.length > 0) {
              toast({
                title: "Quick Wins",
                description: `${quickTasks.length} tasks under 15 minutes`,
              });
            } else {
              toast({
                title: "No Quick Tasks",
                description: "All remaining tasks need more time",
              });
            }
          }}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Quick Wins
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            const completedTasks = tasks.filter(t => t.completed);
            if (completedTasks.length > 0) {
              completedTasks.forEach(task => handleDeleteTask(task.id));
              toast({
                title: "Cleanup Complete",
                description: `Removing ${completedTasks.length} completed tasks`,
              });
            } else {
              toast({
                title: "Nothing to Clear",
                description: "No completed tasks to remove",
              });
            }
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Clear Done
        </Button>
      </div>

      {/* Enhanced Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Your Tasks
              <Badge variant="secondary" className="ml-2">
                AI Sorted
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{tasks.filter(t => !t.completed).length} active</span>
              <span>•</span>
              <span>{tasks.filter(t => t.completed).length} done</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Ready to be productive?</p>
              <p>Add your first task above and let AI help prioritize your day!</p>
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
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium flex-1 ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
                        {task.title}
                      </p>
                      {task.estimatedDuration && (
                        <span className="text-xs text-gray-400">
                          {task.estimatedDuration}min
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getContextColor(task.context)} size="sm">
                        {task.context}
                      </Badge>
                      {task.aiScore && (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-xs">
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
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                  >
                    ×
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
