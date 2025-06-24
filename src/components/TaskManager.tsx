
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
}

export const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const { toast } = useToast();

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      priority,
      completed: false,
      createdAt: new Date(),
    };

    setTasks([task, ...tasks]);
    setNewTask("");
    toast({
      title: "Task added",
      description: "Your task has been added successfully!",
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Task */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter your task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              className="flex-1"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
              className="px-3 py-2 border rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus size={18} />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tasks yet. Add one above to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
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
