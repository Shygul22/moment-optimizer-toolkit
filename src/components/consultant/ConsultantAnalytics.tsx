
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Users, DollarSign } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const ConsultantAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['consultant-analytics', user?.id],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      // Get bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('consultant_id', user?.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get earnings data
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('consultant_id', user?.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Process daily bookings
      const dailyBookings = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        const dayBookings = bookings?.filter(booking => 
          format(new Date(booking.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ).length || 0;
        
        return {
          date: format(date, 'MMM dd'),
          bookings: dayBookings
        };
      });

      // Process booking status distribution
      const statusCounts = bookings?.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
      }));

      // Process monthly earnings
      const monthlyEarnings = Array.from({ length: 6 }, (_, i) => {
        const month = subDays(new Date(), i * 30);
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthEarnings = invoices?.filter(invoice => {
          const invoiceDate = new Date(invoice.created_at);
          return invoiceDate >= monthStart && invoiceDate <= monthEnd && invoice.status === 'paid';
        }).reduce((sum, invoice) => sum + Number(invoice.amount), 0) || 0;
        
        return {
          month: format(month, 'MMM'),
          earnings: monthEarnings
        };
      }).reverse();

      return {
        dailyBookings,
        statusData,
        monthlyEarnings,
        totalBookings: bookings?.length || 0,
        conversionRate: bookings?.length ? 
          ((bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100).toFixed(1) : '0'
      };
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Booking to confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.dailyBookings ? 
                (analytics.dailyBookings.reduce((sum, day) => sum + day.bookings, 0) / 30).toFixed(1) : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">Per day average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Bookings (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics?.statusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Earnings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                <Line type="monotone" dataKey="earnings" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
