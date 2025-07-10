
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, TrendingUp, Users, Calendar, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  pendingQuestionnaires: number;
  recentActivity: any[];
}

export const DynamicAdminDashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Real-time dashboard stats
  const { data: stats, refetch: refetchStats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats', selectedTimeRange],
    queryFn: async () => {
      const now = new Date();
      const timeRanges = {
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };
      
      const startDate = timeRanges[selectedTimeRange as keyof typeof timeRanges];

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, updated_at')
        .gte('updated_at', startDate.toISOString());

      // Fetch bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, status, created_at, client_id, consultant_id')
        .gte('created_at', startDate.toISOString());

      // Fetch questionnaires
      const { data: questionnaires, error: questionnairesError } = await supabase
        .from('client_questionnaires')
        .select('id, status, submitted_at, client_name')
        .eq('status', 'pending');

      // Fetch recent activity (bookings and questionnaires)
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('id, status, created_at, client_id')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentQuestionnaires } = await supabase
        .from('client_questionnaires')
        .select('id, status, submitted_at, client_name')
        .order('submitted_at', { ascending: false })
        .limit(5);

      if (usersError || bookingsError || questionnairesError) {
        throw new Error('Failed to fetch dashboard data');
      }

      const recentActivity = [
        ...(recentBookings?.map(b => ({ ...b, type: 'booking', timestamp: b.created_at })) || []),
        ...(recentQuestionnaires?.map(q => ({ ...q, type: 'questionnaire', timestamp: q.submitted_at })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        totalUsers: users?.length || 0,
        totalBookings: bookings?.length || 0,
        pendingQuestionnaires: questionnaires?.length || 0,
        recentActivity: recentActivity.slice(0, 10)
      } as DashboardStats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchStats();
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh indicator
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        refetchStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchStats, isRefreshing]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'questionnaire':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dynamic Dashboard</h2>
          <p className="text-muted-foreground">Real-time platform overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <TabsList>
              <TabsTrigger value="24h">24h</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="30d">30d</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dynamic Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active in last {selectedTimeRange}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Created in last {selectedTimeRange}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.pendingQuestionnaires || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin review
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : Math.round(((stats?.totalUsers || 0) + (stats?.totalBookings || 0)) / 2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Platform engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : stats?.recentActivity?.length ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm font-medium">
                        {activity.type === 'booking' ? 'New Booking' : 'New Questionnaire'}
                        {activity.client_name && ` from ${activity.client_name}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Real-time Updates Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live updates every 30 seconds
        </div>
      </div>
    </div>
  );
};
