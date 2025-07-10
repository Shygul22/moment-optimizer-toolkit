import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Eye, FileText, Plus, Edit, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CreateInvoiceForm } from './CreateInvoiceForm';
import { InvoiceViewModal } from './InvoiceViewModal';
import { InvoiceDraftManager } from './InvoiceDraftManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { InvoicePDF } from './InvoicePDF';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  is_draft: boolean;
  admin_signature?: any;
  signature_date?: string;
  signed_by?: string;
};
type Profile = Database['public']['Tables']['profiles']['Row'];

type EnrichedInvoice = Invoice & {
  client: Pick<Profile, 'id' | 'full_name'> | null;
  consultant: Pick<Profile, 'id' | 'full_name'> | null;
};

const fetchInvoices = async (userId: string | undefined, isAdmin: boolean): Promise<EnrichedInvoice[]> => {
  if (!userId) return [];
  
  let query = supabase
    .from('invoices')
    .select(`
      *,
      client:profiles!client_id(id, full_name),
      consultant:profiles!consultant_id(id, full_name)
    `);

  if (!isAdmin) {
    query = query.or(`client_id.eq.${userId},consultant_id.eq.${userId}`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    throw new Error(error.message);
  }
  return data as EnrichedInvoice[];
};

const getStatusVariant = (status: Invoice['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'outline';
    case 'overdue':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function InvoiceList() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = roles.includes('admin');
  const [selectedInvoice, setSelectedInvoice] = useState<EnrichedInvoice | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', user?.id, isAdmin],
    queryFn: () => fetchInvoices(user?.id, isAdmin),
    enabled: !!user,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCreateInvoiceSuccess = () => {
    setShowCreateForm(false);
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  const handleDownloadInvoice = (invoice: EnrichedInvoice) => {
    console.log(`Downloading invoice ${invoice.invoice_number}`);
  };

  // Filter invoices based on active tab
  const filteredInvoices = invoices?.filter(invoice => {
    if (activeTab === 'all') return true;
    if (activeTab === 'drafts') return invoice.is_draft;
    if (activeTab === 'finalized') return !invoice.is_draft;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Here are all your invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
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
          <AlertTitle>Error fetching invoices</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Invoices</CardTitle>
              <CardDescription>
                {isAdmin ? 'All system invoices with draft and signature management' : 'Your invoices and payment history'}
              </CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowCreateForm(true)} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {isAdmin && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All Invoices</TabsTrigger>
                <TabsTrigger value="drafts" className="text-xs sm:text-sm">Drafts</TabsTrigger>
                <TabsTrigger value="finalized" className="text-xs sm:text-sm">Finalized</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {filteredInvoices && filteredInvoices.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Consultant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      {isAdmin && <TableHead>Signature</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.client?.full_name ?? 'N/A'}</TableCell>
                        <TableCell>{invoice.consultant?.full_name ?? 'N/A'}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatCurrency(Number(invoice.amount))}</div>
                            {invoice.original_amount && invoice.discount_amount && (
                              <div className="text-sm text-muted-foreground">
                                Original: {formatCurrency(Number(invoice.original_amount))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {invoice.discount_amount ? (
                            <div className="text-sm text-green-600">
                              -{formatCurrency(Number(invoice.discount_amount))}
                              {invoice.discount_type && (
                                <div className="text-xs text-muted-foreground capitalize">
                                  {invoice.discount_source_type}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                            {invoice.is_draft && (
                              <Badge variant="outline" className="text-orange-600">Draft</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.due_at), 'MMM d, yyyy')}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            {invoice.admin_signature ? (
                              <Badge variant="outline" className="text-green-600">Signed</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">Unsigned</Badge>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {!invoice.is_draft && (
                              <InvoicePDF 
                                invoice={invoice} 
                                onDownload={() => handleDownloadInvoice(invoice)}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id}>
                    {isAdmin && invoice.is_draft ? (
                      <InvoiceDraftManager
                        invoice={invoice}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['invoices'] })}
                      />
                    ) : (
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium text-sm">{invoice.invoice_number}</div>
                              <div className="text-xs text-muted-foreground">
                                {invoice.client?.full_name ?? 'N/A'}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              <Badge variant={getStatusVariant(invoice.status)} className="text-xs">
                                {invoice.status}
                              </Badge>
                              {invoice.is_draft && (
                                <Badge variant="outline" className="text-orange-600 text-xs">Draft</Badge>
                              )}
                              {isAdmin && invoice.admin_signature && (
                                <Badge variant="outline" className="text-green-600 text-xs">Signed</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-medium">{formatCurrency(Number(invoice.amount))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Due Date:</span>
                              <span>{format(new Date(invoice.due_at), 'MMM d, yyyy')}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvoice(invoice)}
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {!invoice.is_draft && (
                              <InvoicePDF 
                                invoice={invoice} 
                                onDownload={() => handleDownloadInvoice(invoice)}
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">
                {activeTab === 'drafts' ? 'No draft invoices' : 
                 activeTab === 'finalized' ? 'No finalized invoices' : 'No invoices yet'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAdmin ? 'Create your first invoice to get started.' : 'Invoices will appear here when they are created.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Draft Management Section */}
      {isAdmin && activeTab === 'drafts' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Draft Management</CardTitle>
            <CardDescription>Manage and finalize draft invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {filteredInvoices.filter(inv => inv.is_draft).map((invoice) => (
                <InvoiceDraftManager
                  key={invoice.id}
                  invoice={invoice}
                  onSuccess={() => queryClient.invalidateQueries({ queryKey: ['invoices'] })}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <CreateInvoiceForm
          onSuccess={handleCreateInvoiceSuccess}
        />
      )}

      {selectedInvoice && (
        <InvoiceViewModal
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onOpenChange={(open) => {
            if (!open) setSelectedInvoice(null);
          }}
        />
      )}
    </>
  );
}
