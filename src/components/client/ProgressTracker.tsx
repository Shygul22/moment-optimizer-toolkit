
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface ProgressTrackerProps {
  todos: Array<{
    id: string;
    title: string;
    completed: boolean;
    created_at: string;
  }>;
  bookings: Array<{
    id: string;
    start_time: string;
    status: string;
  }>;
}

export const ProgressTracker = ({ todos, bookings }: ProgressTrackerProps) => {
  const completedTodos = todos.filter(todo => todo.completed).length;
  const totalTodos = todos.length;
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const thisWeekStart = startOfWeek(new Date());
  const thisWeekEnd = endOfWeek(new Date());
  
  const thisWeekBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.start_time);
    return bookingDate >= thisWeekStart && bookingDate <= thisWeekEnd;
  });

  const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' && new Date(booking.start_time) > new Date()
  ).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Todo Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Tasks Completed</span>
              </div>
              <Badge variant="outline">
                {completedTodos}/{totalTodos}
              </Badge>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {completionRate.toFixed(0)}% of your tasks are complete
            </p>
          </div>

          {/* Weekly Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{thisWeekBookings.length}</div>
              <p className="text-xs text-muted-foreground">This Week's Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedBookings}</div>
              <p className="text-xs text-muted-foreground">Total Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Complete 5 Tasks This Week</p>
                <p className="text-xs text-muted-foreground">Stay on track with your goals</p>
              </div>
              <Badge variant={completedTodos >= 5 ? 'default' : 'secondary'}>
                {completedTodos >= 5 ? 'Achieved!' : `${completedTodos}/5`}
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Attend Weekly Session</p>
                <p className="text-xs text-muted-foreground">Regular consultations boost progress</p>
              </div>
              <Badge variant={thisWeekBookings.length > 0 ? 'default' : 'secondary'}>
                {thisWeekBookings.length > 0 ? 'On Track!' : 'Schedule Now'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {upcomingBookings > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{upcomingBookings}</div>
                <p className="text-sm text-muted-foreground">Sessions scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
