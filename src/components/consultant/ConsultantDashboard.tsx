
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Users, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { AvailabilityManager } from './AvailabilityManager';
import { ClientManager } from './ClientManager';
import { EarningsTracker } from './EarningsTracker';
import { ConsultantAnalytics } from './ConsultantAnalytics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ConsultantDashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['consultant-stats', user?.id],
    queryFn: async () => {
      const [bookingsRes, availabilityRes, earningsRes] = await Promise.all([
        supabase.from('bookings').select('*').eq('consultant_id', user?.id),
        supabase.from('consultant_availability').select('*').eq('consultant_id', user?.id),
        supabase.from('invoices').select('amount').eq('consultant_id', user?.id).eq('status', 'paid')
      ]);

      const totalBookings = bookingsRes.data?.length || 0;
      const confirmedBookings = bookingsRes.data?.filter(b => b.status === 'confirmed').length || 0;
      const totalSlots = availabilityRes.data?.length || 0;
      const totalEarnings = earningsRes.data?.reduce((sum, invoice) => sum + Number(invoice.amount), 0) || 0;

      return {
        totalBookings,
        confirmedBookings,
        totalSlots,
        totalEarnings
      };
    },
    enabled: !!user?.id
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consultant Dashboard</h1>
        <p className="text-muted-foreground">Manage your consulting business</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.confirmedBookings || 0}</div>
            <p className="text-xs text-muted-foreground">Confirmed appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSlots || 0}</div>
            <p className="text-xs text-muted-foreground">Time slots created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Features */}
      <Tabs defaultValue="availability" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="availability">
          <AvailabilityManager />
        </TabsContent>

        <TabsContent value="clients">
          <ClientManager />
        </TabsContent>

        <TabsContent value="earnings">
          <EarningsTracker />
        </TabsContent>

        <TabsContent value="analytics">
          <ConsultantAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
