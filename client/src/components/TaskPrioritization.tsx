import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Target, 
  Brain, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from "lucide-react";
import { Task } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface TaskPrioritizationProps {
  tasks: Task[];
  onTaskPriorityUpdate: (taskId: number, newPriority: string) => void;
  onTaskReorder: (reorderedTasks: Task[]) => void;
}

interface PrioritizationMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface PrioritizedTask extends Task {
  priorityScore: number;
  eisenhowerQuadrant: 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'neither';
  eatTheFrogScore: number;
  paretoScore: number;
  aiRecommendation: string;
}

const prioritizationMethods: PrioritizationMethod[] = [
  {
    id: 'eisenhower',
    name: 'Eisenhower Matrix',
    description: 'Categorize tasks by urgency and importance',
    icon: Target,
    color: 'blue'
  },
  {
    id: 'eat-the-frog',
    name: 'Eat the Frog',
    description: 'Tackle the most challenging task first',
    icon: Zap,
    color: 'green'
  },
  {
    id: 'pareto',
    name: '80/20 Rule',
    description: 'Focus on high-impact activities',
    icon: TrendingUp,
    color: 'purple'
  },
  {
    id: 'ai-composite',
    name: 'AI Composite',
    description: 'Smart blend of all methodologies',
    icon: Brain,
    color: 'indigo'
  }
];

export const TaskPrioritization = ({ 
  tasks, 
  onTaskPriorityUpdate, 
  onTaskReorder 
}: TaskPrioritizationProps) => {
  const [selectedMethod, setSelectedMethod] = useState('ai-composite');
  const [prioritizedTasks, setPrioritizedTasks] = useState<PrioritizedTask[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Calculate Eisenhower Matrix quadrant
  const calculateEisenhowerQuadrant = (task: Task): PrioritizedTask['eisenhowerQuadrant'] => {
    const isUrgent = task.priority === 'high' || (task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
    const isImportant = (task.impact || 0) >= 4 || task.priority === 'high';
    
    if (isUrgent && isImportant) return 'urgent-important';
    if (!isUrgent && isImportant) return 'important-not-urgent';
    if (isUrgent && !isImportant) return 'urgent-not-important';
    return 'neither';
  };

  // Calculate Eat the Frog score (difficulty + procrastination tendency)
  const calculateEatTheFrogScore = (task: Task): number => {
    const complexity = task.complexity || 3;
    const estimatedTime = task.estimatedDuration || 30;
    const impact = task.impact || 3;
    
    // Higher score = more likely to be procrastinated on
    return (complexity * 0.4) + (estimatedTime / 60 * 0.3) + (5 - impact) * 0.3;
  };

  // Calculate Pareto (80/20) score
  const calculateParetoScore = (task: Task): number => {
    const impact = task.impact || 3;
    const complexity = task.complexity || 3;
    const effort = task.estimatedDuration || 30;
    
    // Higher score = better impact-to-effort ratio
    return (impact * impact) / (complexity + effort / 60);
  };

  // AI Composite scoring algorithm
  const calculateAICompositeScore = (task: Task): number => {
    const eisenhowerWeight = {
      'urgent-important': 1.0,
      'important-not-urgent': 0.8,
      'urgent-not-important': 0.6,
      'neither': 0.3
    };

    const quadrant = calculateEisenhowerQuadrant(task);
    const frogScore = calculateEatTheFrogScore(task);
    const paretoScore = calculateParetoScore(task);
    
    // Normalize scores
    const eisenhowerScore = eisenhowerWeight[quadrant];
    const normalizedFrogScore = Math.max(0, 1 - (frogScore - 1) / 4); // Invert - lower frog score = higher priority
    const normalizedParetoScore = Math.min(1, paretoScore / 10);
    
    // Weighted combination
    return (eisenhowerScore * 0.4) + (normalizedFrogScore * 0.3) + (normalizedParetoScore * 0.3);
  };

  // Generate AI recommendation
  const generateAIRecommendation = (task: PrioritizedTask): string => {
    const { eisenhowerQuadrant, eatTheFrogScore, paretoScore } = task;
    
    if (eisenhowerQuadrant === 'urgent-important') {
      return "🔥 Do first - Critical and time-sensitive";
    } else if (eisenhowerQuadrant === 'important-not-urgent') {
      return "📅 Schedule - Important for long-term success";
    } else if (eatTheFrogScore > 3.5) {
      return "🐸 Eat the frog - Tackle when energy is highest";
    } else if (paretoScore > 5) {
      return "⚡ High impact - Great return on investment";
    } else if (eisenhowerQuadrant === 'urgent-not-important') {
      return "👥 Delegate if possible - Urgent but low impact";
    } else {
      return "🗑️ Consider eliminating - Low priority";
    }
  };

  // Analyze and prioritize tasks
  const analyzeTasks = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const analyzed: PrioritizedTask[] = tasks.map(task => {
        const eisenhowerQuadrant = calculateEisenhowerQuadrant(task);
        const eatTheFrogScore = calculateEatTheFrogScore(task);
        const paretoScore = calculateParetoScore(task);
        const aiScore = calculateAICompositeScore(task);
        
        const prioritizedTask: PrioritizedTask = {
          ...task,
          priorityScore: selectedMethod === 'ai-composite' ? aiScore : 
                        selectedMethod === 'eisenhower' ? (eisenhowerQuadrant === 'urgent-important' ? 1 : eisenhowerQuadrant === 'important-not-urgent' ? 0.8 : eisenhowerQuadrant === 'urgent-not-important' ? 0.6 : 0.3) :
                        selectedMethod === 'eat-the-frog' ? Math.max(0, (5 - eatTheFrogScore) / 5) :
                        Math.min(1, paretoScore / 10),
          eisenhowerQuadrant,
          eatTheFrogScore,
          paretoScore,
          aiRecommendation: ''
        };
        
        prioritizedTask.aiRecommendation = generateAIRecommendation(prioritizedTask);
        return prioritizedTask;
      });

      // Sort by priority score (highest first)
      const sorted = analyzed.sort((a, b) => b.priorityScore - a.priorityScore);
      setPrioritizedTasks(sorted);
      onTaskReorder(sorted);
      setIsAnalyzing(false);
      
      toast({
        title: "Tasks Prioritized",
        description: `Ranked ${sorted.length} tasks using ${prioritizationMethods.find(m => m.id === selectedMethod)?.name}`,
      });
    }, 1000);
  };

  useEffect(() => {
    if (tasks.length > 0) {
      const timeoutId = setTimeout(() => {
        setIsAnalyzing(true);
        
        const analyzed: PrioritizedTask[] = tasks.map(task => {
          const eisenhowerQuadrant = calculateEisenhowerQuadrant(task);
          const eatTheFrogScore = calculateEatTheFrogScore(task);
          const paretoScore = calculateParetoScore(task);
          const aiScore = calculateAICompositeScore(task);
          
          const prioritizedTask: PrioritizedTask = {
            ...task,
            priorityScore: selectedMethod === 'ai-composite' ? aiScore : 
                          selectedMethod === 'eisenhower' ? (eisenhowerQuadrant === 'urgent-important' ? 1 : eisenhowerQuadrant === 'important-not-urgent' ? 0.8 : eisenhowerQuadrant === 'urgent-not-important' ? 0.6 : 0.3) :
                          selectedMethod === 'eat-the-frog' ? Math.max(0, (5 - eatTheFrogScore) / 5) :
                          Math.min(1, paretoScore / 10),
            eisenhowerQuadrant,
            eatTheFrogScore,
            paretoScore,
            aiRecommendation: ''
          };
          
          prioritizedTask.aiRecommendation = generateAIRecommendation(prioritizedTask);
          return prioritizedTask;
        });

        // Sort by priority score (highest first)
        const sorted = analyzed.sort((a, b) => b.priorityScore - a.priorityScore);
        setPrioritizedTasks(sorted);
        onTaskReorder(sorted);
        setIsAnalyzing(false);
        
        toast({
          title: "Tasks Prioritized",
          description: `Ranked ${sorted.length} tasks using ${prioritizationMethods.find(m => m.id === selectedMethod)?.name}`,
        });
      }, 300); // Debounce to prevent excessive re-analysis
      
      return () => clearTimeout(timeoutId);
    } else {
      setPrioritizedTasks([]);
    }
  }, [tasks, selectedMethod, onTaskReorder, toast]);

  const getQuadrantColor = (quadrant: PrioritizedTask['eisenhowerQuadrant']) => {
    const colors = {
      'urgent-important': 'bg-red-100 text-red-700 border-red-200',
      'important-not-urgent': 'bg-blue-100 text-blue-700 border-blue-200',
      'urgent-not-important': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'neither': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[quadrant];
  };

  const getQuadrantLabel = (quadrant: PrioritizedTask['eisenhowerQuadrant']) => {
    const labels = {
      'urgent-important': 'Do First',
      'important-not-urgent': 'Schedule',
      'urgent-not-important': 'Delegate',
      'neither': 'Eliminate'
    };
    return labels[quadrant];
  };

  const getPriorityIcon = (score: number) => {
    if (score > 0.8) return <ArrowUp className="h-4 w-4 text-red-600" />;
    if (score > 0.6) return <ArrowUp className="h-4 w-4 text-orange-600" />;
    if (score > 0.4) return <ArrowDown className="h-4 w-4 text-yellow-600" />;
    return <ArrowDown className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Task Prioritization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {prioritizationMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <Card 
                  key={method.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${
                        method.color === 'blue' ? 'text-blue-600' :
                        method.color === 'green' ? 'text-green-600' :
                        method.color === 'purple' ? 'text-purple-600' :
                        'text-indigo-600'
                      }`} />
                      <h4 className="font-medium text-sm">{method.name}</h4>
                    </div>
                    <p className="text-xs text-gray-600">{method.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <Button 
            onClick={analyzeTasks} 
            disabled={isAnalyzing || tasks.length === 0}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Tasks...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Re-analyze with {prioritizationMethods.find(m => m.id === selectedMethod)?.name}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Prioritized Task List */}
      {prioritizedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Prioritized Task List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prioritizedTasks.map((task, index) => (
              <Card key={task.id} className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-bold">
                          #{index + 1}
                        </Badge>
                        {getPriorityIcon(task.priorityScore)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.aiRecommendation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        Score: {(task.priorityScore * 100).toFixed(0)}%
                      </div>
                      <Progress value={task.priorityScore * 100} className="w-20 h-2 mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getQuadrantColor(task.eisenhowerQuadrant)}>
                      {getQuadrantLabel(task.eisenhowerQuadrant)}
                    </Badge>
                    
                    {selectedMethod === 'eat-the-frog' && task.eatTheFrogScore > 3 && (
                      <Badge variant="outline" className="text-green-700 bg-green-50">
                        🐸 Frog Task
                      </Badge>
                    )}
                    
                    {selectedMethod === 'pareto' && task.paretoScore > 5 && (
                      <Badge variant="outline" className="text-purple-700 bg-purple-50">
                        ⚡ High Impact
                      </Badge>
                    )}
                    
                    <Badge variant="outline" className="text-xs">
                      {task.estimatedDuration || 30}min
                    </Badge>
                    
                    <Badge variant="outline" className="text-xs">
                      Impact: {task.impact || 3}/5
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Tasks to Prioritize</h3>
            <p className="text-gray-600">Create some tasks first, then come back to prioritize them using AI-powered methodologies.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};