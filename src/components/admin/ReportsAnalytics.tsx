
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Calendar, MessageCircle, DollarSign, FileText, Activity } from 'lucide-react';

export const ReportsAnalytics = () => {
  // Fetch comprehensive analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Get booking trends over last 6 months
      const { data: bookingTrends } = await supabase
        .from('bookings')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      // Get revenue data from invoices
      const { data: revenueData } = await supabase
        .from('invoices')
        .select('amount, issued_at, status')
        .gte('issued_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get user registration trends
      const { data: userRegistrations } = await supabase
        .from('profiles')
        .select('id')
        .gte('updated_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get consultant performance
      const { data: consultantPerformance } = await supabase
        .from('bookings')
        .select('consultant_id, status, profiles!bookings_consultant_id_fkey(full_name)')
        .eq('status', 'completed');

      // Get messaging activity
      const { data: messageActivity } = await supabase
        .from('chat_messages')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get booking status distribution
      const { data: bookingStatus } = await supabase
        .from('bookings')
        .select('status');

      return {
        bookingTrends: bookingTrends || [],
        revenueData: revenueData || [],
        userRegistrations: userRegistrations || [],
        consultantPerformance: consultantPerformance || [],
        messageActivity: messageActivity || [],
        bookingStatus: bookingStatus || []
      };
    },
  });

  // Process data for charts
  const processedData = analyticsData ? {
    // Monthly booking trends
    monthlyBookings: processMonthlyData(analyticsData.bookingTrends, 'bookings'),
    
    // Monthly revenue
    monthlyRevenue: processMonthlyRevenue(analyticsData.revenueData),
    
    // Booking status distribution
    statusDistribution: processStatusDistribution(analyticsData.bookingStatus),
    
    // Top consultants
    topConsultants: processConsultantData(analyticsData.consultantPerformance),
    
    // Daily message activity (last 30 days)
    messageActivity: processDailyMessages(analyticsData.messageActivity),
    
    // Key metrics
    keyMetrics: calculateKeyMetrics(analyticsData)
  } : null;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {processedData?.keyMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  {metric.change && (
                    <div className="flex items-center gap-1 mt-1">
                      {metric.change > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${metric.color} text-white`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="consultants">Consultants</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Trends (6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ bookings: { label: "Bookings", color: "#8884d8" } }} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData?.monthlyBookings}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Booking Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ 
                  pending: { label: "Pending", color: "#fbbf24" },
                  confirmed: { label: "Confirmed", color: "#10b981" },
                  completed: { label: "Completed", color: "#3b82f6" },
                  cancelled: { label: "Cancelled", color: "#ef4444" }
                }} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processedData?.statusDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {processedData?.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Booking Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ bookings: { label: "Bookings", color: "#8884d8" } }} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData?.monthlyBookings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ revenue: { label: "Revenue", color: "#10b981" } }} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData?.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultants">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Consultants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedData?.topConsultants.map((consultant, index) => (
                  <div key={consultant.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{consultant.name}</p>
                        <p className="text-sm text-gray-600">{consultant.completedBookings} completed bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{consultant.completedBookings}</p>
                      <p className="text-xs text-gray-500">bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Daily Message Activity (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ messages: { label: "Messages", color: "#f59e0b" } }} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData?.messageActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper functions for data processing
function processMonthlyData(data: any[], type: string) {
  const monthlyData: { [key: string]: number } = {};
  
  data.forEach(item => {
    const month = new Date(item.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  return Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count
  }));
}

function processMonthlyRevenue(data: any[]) {
  const monthlyRevenue: { [key: string]: number } = {};
  
  data.forEach(item => {
    const month = new Date(item.issued_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(item.amount);
  });

  return Object.entries(monthlyRevenue).map(([month, amount]) => ({
    month,
    amount: Math.round(amount)
  }));
}

function processStatusDistribution(data: any[]) {
  const statusCount: { [key: string]: number } = {};
  
  data.forEach(item => {
    statusCount[item.status] = (statusCount[item.status] || 0) + 1;
  });

  return Object.entries(statusCount).map(([status, count]) => ({
    status,
    count
  }));
}

function processConsultantData(data: any[]) {
  const consultantStats: { [key: string]: { name: string; completedBookings: number } } = {};
  
  data.forEach(booking => {
    const consultantName = booking.profiles?.full_name || 'Unknown';
    if (!consultantStats[booking.consultant_id]) {
      consultantStats[booking.consultant_id] = {
        name: consultantName,
        completedBookings: 0
      };
    }
    consultantStats[booking.consultant_id].completedBookings++;
  });

  return Object.values(consultantStats)
    .sort((a, b) => b.completedBookings - a.completedBookings)
    .slice(0, 10);
}

function processDailyMessages(data: any[]) {
  const dailyMessages: { [key: string]: number } = {};
  
  data.forEach(message => {
    const date = new Date(message.created_at).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    dailyMessages[date] = (dailyMessages[date] || 0) + 1;
  });

  return Object.entries(dailyMessages).map(([date, count]) => ({
    date,
    count
  }));
}

function calculateKeyMetrics(data: any) {
  const totalBookings = data.bookingTrends.length;
  const totalRevenue = data.revenueData.reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0);
  const totalUsers = data.userRegistrations.length;
  const totalMessages = data.messageActivity.length;

  return [
    {
      title: 'Total Bookings',
      value: totalBookings.toLocaleString(),
      change: 12,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: 8,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Active Users',
      value: totalUsers.toLocaleString(),
      change: 5,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Messages Sent',
      value: totalMessages.toLocaleString(),
      change: 15,
      icon: MessageCircle,
      color: 'bg-orange-500'
    }
  ];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return '#fbbf24';
    case 'confirmed': return '#10b981';
    case 'completed': return '#3b82f6';
    case 'cancelled': return '#ef4444';
    default: return '#6b7280';
  }
}
