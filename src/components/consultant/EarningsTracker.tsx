
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const EarningsTracker = () => {
  const { user } = useAuth();

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['consultant-earnings', user?.id],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:profiles!client_id(full_name),
          booking:bookings!booking_id(start_time)
        `)
        .eq('consultant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalEarnings = invoices?.reduce((sum, invoice) => {
        return invoice.status === 'paid' ? sum + Number(invoice.amount) : sum;
      }, 0) || 0;

      const pendingEarnings = invoices?.reduce((sum, invoice) => {
        return invoice.status === 'pending' ? sum + Number(invoice.amount) : sum;
      }, 0) || 0;

      const thisMonthEarnings = invoices?.reduce((sum, invoice) => {
        const invoiceMonth = new Date(invoice.created_at).getMonth();
        const currentMonth = new Date().getMonth();
        return (invoice.status === 'paid' && invoiceMonth === currentMonth) 
          ? sum + Number(invoice.amount) : sum;
      }, 0) || 0;

      return {
        invoices: invoices || [],
        totalEarnings,
        pendingEarnings,
        thisMonthEarnings
      };
    },
    enabled: !!user?.id
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'outline';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earnings?.totalEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earnings?.thisMonthEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">Current month earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earnings?.pendingEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices ({earnings?.invoices?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : earnings?.invoices?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.client?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{formatCurrency(Number(invoice.amount))}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(invoice.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.due_at), 'MMM d, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">No invoices yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Invoices will appear here when you create them for your clients.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
