import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Grid3X3, 
  Fish, 
  BarChart3,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Task } from '../types/Task';
import { 
  applyEisenhowerMatrix, 
  applyEatTheFrog, 
  apply80_20Rule, 
  getCompositeprioritization,
  PrioritizationResult 
} from '../utils/prioritizationAlgorithms';

interface TaskPrioritizationProps {
  tasks: Task[];
  onTaskPriorityUpdate: (taskId: number, newPriority: string) => void;
  onTaskReorder: (reorderedTasks: Task[]) => void;
}

export const TaskPrioritization = ({ 
  tasks, 
  onTaskPriorityUpdate, 
  onTaskReorder 
}: TaskPrioritizationProps) => {
  const [activeMethod, setActiveMethod] = useState<'eisenhower' | 'eat-the-frog' | '80-20-rule' | 'composite'>('composite');
  const [results, setResults] = useState<{ [key: string]: PrioritizationResult[] }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoApply, setAutoApply] = useState(false);

  // Run analysis when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      runPrioritizationAnalysis();
    }
  }, [tasks]);

  const runPrioritizationAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Run all prioritization methods
      const eisenhowerResults = applyEisenhowerMatrix(tasks);
      const eatFrogResults = applyEatTheFrog(tasks);
      const paretoResults = apply80_20Rule(tasks);
      const compositeResults = getCompositeprioritization(tasks);
      
      setResults({
        eisenhower: eisenhowerResults,
        'eat-the-frog': eatFrogResults,
        '80-20-rule': paretoResults,
        composite: compositeResults.recommendations,
      });
    } catch (error) {
      console.error('Error running prioritization analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyPrioritization = (method: string) => {
    const methodResults = results[method];
    if (!methodResults) return;

    // Apply suggested priorities to tasks
    methodResults.forEach(result => {
      if (result.originalPriority !== result.calculatedPriority) {
        onTaskPriorityUpdate(result.taskId, result.calculatedPriority);
      }
    });

    // Reorder tasks based on priority scores
    const reorderedTasks = [...tasks].sort((a, b) => {
      const aResult = methodResults.find(r => r.taskId === a.id);
      const bResult = methodResults.find(r => r.taskId === b.id);
      return (bResult?.score || 0) - (aResult?.score || 0);
    });

    onTaskReorder(reorderedTasks);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'eisenhower': return Grid3X3;
      case 'eat-the-frog': return Fish;
      case '80-20-rule': return BarChart3;
      case 'composite': return Brain;
      default: return Target;
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'eisenhower': 
        return 'Categorizes tasks by urgency and importance into 4 quadrants';
      case 'eat-the-frog': 
        return 'Prioritizes the most challenging tasks first when energy is highest';
      case '80-20-rule': 
        return 'Focuses on the 20% of tasks that deliver 80% of results';
      case 'composite': 
        return 'Combines all three methods for balanced prioritization';
      default: 
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQuadrantColor = (quadrant: string) => {
    if (quadrant.includes('Q1')) return 'bg-red-50 border-red-200';
    if (quadrant.includes('Q2')) return 'bg-green-50 border-green-200';
    if (quadrant.includes('Q3')) return 'bg-yellow-50 border-yellow-200';
    if (quadrant.includes('Q4')) return 'bg-gray-50 border-gray-200';
    return 'bg-gray-50 border-gray-200';
  };

  const currentResults = results[activeMethod] || [];
  const hasChanges = currentResults.some(r => r.originalPriority !== r.calculatedPriority);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Smart Task Prioritization
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered task prioritization using proven methodologies
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runPrioritizationAnalysis}
              disabled={isAnalyzing || tasks.length === 0}
              variant="outline"
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
            {hasChanges && (
              <Button
                onClick={() => applyPrioritization(activeMethod)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Apply Changes
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No tasks to prioritize</p>
            <p className="text-sm mt-1">Add some tasks to see prioritization suggestions</p>
          </div>
        ) : (
          <Tabs value={activeMethod} onValueChange={(value: any) => setActiveMethod(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="composite" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                Smart
              </TabsTrigger>
              <TabsTrigger value="eisenhower" className="text-xs">
                <Grid3X3 className="w-3 h-3 mr-1" />
                Eisenhower
              </TabsTrigger>
              <TabsTrigger value="eat-the-frog" className="text-xs">
                <Fish className="w-3 h-3 mr-1" />
                Eat Frog
              </TabsTrigger>
              <TabsTrigger value="80-20-rule" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                80/20
              </TabsTrigger>
            </TabsList>

            {/* Method Description */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>{activeMethod.charAt(0).toUpperCase() + activeMethod.slice(1).replace('-', ' ')}:</strong>{' '}
                {getMethodDescription(activeMethod)}
              </p>
            </div>

            {/* Results for each method */}
            {['composite', 'eisenhower', 'eat-the-frog', '80-20-rule'].map(method => (
              <TabsContent key={method} value={method} className="mt-4">
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {(results[method] || []).map((result, index) => {
                      const task = tasks.find(t => t.id === result.taskId);
                      if (!task) return null;

                      const priorityChanged = result.originalPriority !== result.calculatedPriority;
                      
                      return (
                        <div
                          key={result.taskId}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            priorityChanged 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPriorityColor(result.originalPriority)}>
                                  Current: {result.originalPriority}
                                </Badge>
                                {priorityChanged && (
                                  <>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <Badge className={getPriorityColor(result.calculatedPriority)}>
                                      Suggested: {result.calculatedPriority}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline" className="text-xs">
                                Score: {result.score.toFixed(1)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </div>
                          </div>

                          {/* Method-specific info */}
                          {result.quadrant && (
                            <div className={`p-2 rounded border mb-2 ${getQuadrantColor(result.quadrant)}`}>
                              <p className="text-xs font-medium">{result.quadrant}</p>
                            </div>
                          )}
                          
                          {result.category && (
                            <div className="p-2 bg-indigo-50 border border-indigo-200 rounded mb-2">
                              <p className="text-xs font-medium text-indigo-800">{result.category}</p>
                            </div>
                          )}

                          <p className="text-sm text-gray-600">{result.reasoning}</p>

                          {/* Progress bar for score */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Priority Score</span>
                              <span>{result.score.toFixed(1)}/10</span>
                            </div>
                            <Progress value={result.score * 10} className="h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for arrow icon
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);