
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { RecordPaymentForm } from './RecordPaymentForm';

export const PaymentHistory = () => {
  const { user, roles } = useAuth();
  const isAdmin = roles.includes('admin');

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments', user?.id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          invoice:invoices(invoice_number, amount, currency),
          client:profiles!payments_client_id_fkey(full_name, business_name)
        `)
        .order('processed_at', { ascending: false });

      // If not admin, filter to only show payments for the current user
      if (!isAdmin) {
        query = query.eq('client_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    return method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-sm sm:text-base">Loading payment history...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600 text-sm sm:text-base">
            Error loading payment history: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <CardTitle className="text-lg sm:text-xl">Payment History</CardTitle>
        {isAdmin && <RecordPaymentForm />}
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {payments && payments.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Invoice #</TableHead>
                    {isAdmin && <TableHead>Client</TableHead>}
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.transaction_id || payment.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.invoice?.invoice_number || 'N/A'}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {payment.client?.business_name || payment.client?.full_name || 'Unknown'}
                        </TableCell>
                      )}
                      <TableCell>
                        {formatCurrency(payment.amount, payment.currency || 'INR')}
                      </TableCell>
                      <TableCell>{getPaymentMethodDisplay(payment.payment_method)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(payment.processed_at), 'dd MMM yyyy')}</div>
                          <div className="text-gray-500">{format(new Date(payment.processed_at), 'hh:mm a')}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-sm">
                          {payment.invoice?.invoice_number || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {payment.transaction_id || payment.id.slice(0, 8)}
                        </div>
                      </div>
                      <Badge className={getStatusColor(payment.status)} variant="secondary">
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(payment.amount, payment.currency || 'INR')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method:</span>
                        <span>{getPaymentMethodDisplay(payment.payment_method)}</span>
                      </div>
                      
                      {isAdmin && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client:</span>
                          <span className="text-right">
                            {payment.client?.business_name || payment.client?.full_name || 'Unknown'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <div className="text-right">
                          <div>{format(new Date(payment.processed_at), 'dd MMM yyyy')}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(payment.processed_at), 'hh:mm a')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
            {isAdmin ? 'No payment history found.' : 'You have no payment history.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
