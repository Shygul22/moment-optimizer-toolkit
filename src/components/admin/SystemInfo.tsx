
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Server, Users, Calendar, MessageCircle, FileText, CreditCard, Phone, Mail } from 'lucide-react';

export const SystemInfo = () => {
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['admin-system-info'],
    queryFn: async () => {
      // Get comprehensive system statistics
      const [
        profilesCount,
        usersCount,
        bookingsCount,
        chatRoomsCount,
        messagesCount,
        invoicesCount,
        paymentsCount
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('chat_rooms').select('*', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true })
      ]);

      // Get role distribution
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role');

      const roleDistribution = roleData?.reduce((acc, item) => {
        acc[item.role] = (acc[item.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get recent activity
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('*, client:profiles!bookings_client_id_fkey(full_name), consultant:profiles!bookings_consultant_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        counts: {
          profiles: profilesCount.count || 0,
          users: usersCount.count || 0,
          bookings: bookingsCount.count || 0,
          chatRooms: chatRoomsCount.count || 0,
          messages: messagesCount.count || 0,
          invoices: invoicesCount.count || 0,
          payments: paymentsCount.count || 0
        },
        roleDistribution,
        recentBookings: recentBookings || []
      };
    },
  });

  const systemMetrics = [
    {
      title: 'Total Profiles',
      value: systemStats?.counts.profiles || 0,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: systemStats?.counts.users || 0,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Total Bookings',
      value: systemStats?.counts.bookings || 0,
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Chat Rooms',
      value: systemStats?.counts.chatRooms || 0,
      icon: MessageCircle,
      color: 'bg-orange-500'
    },
    {
      title: 'Messages',
      value: systemStats?.counts.messages || 0,
      icon: MessageCircle,
      color: 'bg-indigo-500'
    },
    {
      title: 'Invoices',
      value: systemStats?.counts.invoices || 0,
      icon: FileText,
      color: 'bg-red-500'
    },
    {
      title: 'Payments',
      value: systemStats?.counts.payments || 0,
      icon: CreditCard,
      color: 'bg-teal-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contact Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">TP Consulting Services</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+91 9092406569</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>tpconsultingservicesoff@gmail.com</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${metric.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(systemStats?.roleDistribution || {}).map(([role, count]) => (
              <Badge key={role} variant="secondary" className="text-lg px-4 py-2">
                {role}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {systemStats?.recentBookings && systemStats.recentBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemStats.recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.client?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{booking.consultant?.full_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(booking.start_time).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.created_at).toLocaleDateString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent bookings</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
