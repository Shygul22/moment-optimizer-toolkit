
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Target, Clock } from "lucide-react";

export const Dashboard = () => {
  // Mock data - in a real app, this would come from your state management
  const stats = {
    tasksCompleted: 12,
    timeTracked: "4h 32m",
    averageSession: "25m",
    productivity: 85,
  };

  const weeklyData = [
    { day: "Mon", hours: 6.5 },
    { day: "Tue", hours: 7.2 },
    { day: "Wed", hours: 5.8 },
    { day: "Thu", hours: 8.1 },
    { day: "Fri", hours: 6.9 },
    { day: "Sat", hours: 3.2 },
    { day: "Sun", hours: 2.1 },
  ];

  const maxHours = Math.max(...weeklyData.map(d => d.hours));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.tasksCompleted}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Tracked</p>
                <p className="text-2xl font-bold text-blue-600">{stats.timeTracked}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageSession}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Productivity</p>
                <p className="text-2xl font-bold text-orange-600">{stats.productivity}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">
                  {day.day}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{ width: `${(day.hours / maxHours) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {day.hours}h
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Pomodoro Technique</h4>
              <p className="text-sm text-blue-700">
                Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Time Blocking</h4>
              <p className="text-sm text-green-700">
                Schedule specific time blocks for different types of work to maintain focus.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Two-Minute Rule</h4>
              <p className="text-sm text-purple-700">
                If a task takes less than 2 minutes, do it immediately instead of adding it to your list.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Priority Matrix</h4>
              <p className="text-sm text-orange-700">
                Categorize tasks by urgency and importance to focus on what matters most.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
