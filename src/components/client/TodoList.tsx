
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, CheckCircle, Circle, Trash2, Edit2, Save, X, Terminal, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type TodoItem = Database['public']['Tables']['client_todos']['Row'];
type TodoInsert = Database['public']['Tables']['client_todos']['Insert'];
type TodoUpdate = Database['public']['Tables']['client_todos']['Update'];

const fetchTodos = async (userId: string): Promise<TodoItem[]> => {
  const { data, error } = await supabase
    .from('client_todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching todos:', error);
    throw new Error(error.message);
  }
  return data || [];
};

export function TodoList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { data: todos, isLoading, error } = useQuery({
    queryKey: ['client-todos', user?.id],
    queryFn: () => fetchTodos(user!.id),
    enabled: !!user,
  });

  const { mutate: createTodo, isPending: isCreating } = useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      const todoData: TodoInsert = {
        title,
        description,
        user_id: user!.id,
        completed: false,
      };

      const { error } = await supabase
        .from('client_todos')
        .insert([todoData]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Todo created successfully!');
      setNewTodoTitle('');
      setNewTodoDescription('');
      queryClient.invalidateQueries({ queryKey: ['client-todos', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create todo: ${error.message}`);
    },
  });

  const { mutate: updateTodo } = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TodoUpdate }) => {
      const { error } = await supabase
        .from('client_todos')
        .update(updates)
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Todo updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['client-todos', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update todo: ${error.message}`);
    },
  });

  const { mutate: deleteTodo } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_todos')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Todo deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['client-todos', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete todo: ${error.message}`);
    },
  });

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    
    createTodo({
      title: newTodoTitle.trim(),
      description: newTodoDescription.trim() || undefined,
    });
  };

  const handleToggleComplete = (todo: TodoItem) => {
    updateTodo({
      id: todo.id,
      updates: { completed: !todo.completed },
    });
  };

  const handleStartEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  const handleSaveEdit = (id: string) => {
    updateTodo({
      id,
      updates: {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      },
    });
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meeting Notes & Tasks</CardTitle>
          <CardDescription>Keep track of your meeting notes and action items.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error loading todos</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  const completedCount = todos?.filter(todo => todo.completed).length || 0;
  const totalCount = todos?.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meeting Notes & Tasks
            </CardTitle>
            <CardDescription>
              Keep track of your meeting notes and action items.
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              {completedCount}/{totalCount} completed
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">{progressPercentage.toFixed(0)}% done</span>
            </div>
          </div>
        </div>
        {totalCount > 0 && (
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              You're making great progress! Keep it up!
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Todo Form */}
        <form onSubmit={handleCreateTodo} className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Input
              placeholder="Add a new task or note..."
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              className="font-medium"
            />
            <Textarea
              placeholder="Add description or meeting details (optional)..."
              value={newTodoDescription}
              onChange={(e) => setNewTodoDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button 
            type="submit" 
            disabled={!newTodoTitle.trim() || isCreating}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </form>

        {/* Todo List */}
        <div className="space-y-3">
          {todos && todos.length > 0 ? (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-start space-x-3 p-4 border rounded-lg transition-all ${
                  todo.completed ? 'bg-green-50 border-green-200' : 'bg-background hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => handleToggleComplete(todo)}
                  className="mt-1 flex-shrink-0"
                >
                  {todo.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {editingId === todo.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="font-medium"
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="min-h-[60px]"
                        placeholder="Description..."
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(todo.id)}
                          disabled={!editTitle.trim()}
                        >
                          <Save className="mr-1 h-3 w-3" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3
                        className={`font-medium ${
                          todo.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p
                          className={`text-sm ${
                            todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          Created {format(new Date(todo.created_at), 'PPp')}
                        </p>
                        {todo.completed && (
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {editingId !== todo.id && (
                  <div className="flex space-x-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(todo)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tasks or notes yet.</p>
              <p className="text-sm text-muted-foreground">
                Add your first meeting note or action item above.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
