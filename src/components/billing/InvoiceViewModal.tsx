
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { InvoicePDF } from './InvoicePDF';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  due_at: string;
  description?: string;
  line_items?: any;
  is_draft?: boolean;
  admin_signature?: any;
  signature_date?: string;
  client?: {
    full_name?: string;
    business_name?: string;
  };
  consultant?: {
    full_name?: string;
    business_name?: string;
  };
}

interface InvoiceViewModalProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoiceViewModal = ({ invoice, open, onOpenChange }: InvoiceViewModalProps) => {
  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details - {invoice.invoice_number}</DialogTitle>
          <DialogDescription>
            View complete invoice information and download as PDF with signature.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
              {invoice.is_draft && (
                <Badge variant="outline" className="text-orange-600">Draft</Badge>
              )}
              {invoice.admin_signature && (
                <Badge variant="outline" className="text-green-600">Signed</Badge>
              )}
            </div>
            {!invoice.is_draft && (
              <InvoicePDF invoice={invoice} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Client</h3>
              <p className="text-sm">
                {invoice.client?.business_name || invoice.client?.full_name || 'Unknown'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Consultant</h3>
              <p className="text-sm">
                {invoice.consultant?.business_name || invoice.consultant?.full_name || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Amount</h3>
              <p className="text-lg font-semibold">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: invoice.currency || 'USD',
                  minimumFractionDigits: 2,
                }).format(invoice.amount)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Status</h3>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Issued Date</h3>
              <p className="text-sm">
                {format(new Date(invoice.issued_at), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Due Date</h3>
              <p className="text-sm">
                {format(new Date(invoice.due_at), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>
          </div>

          {invoice.admin_signature && (
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Digital Signature</h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img 
                  src={invoice.admin_signature.data} 
                  alt="Admin Signature" 
                  className="max-w-40 max-h-20 border border-gray-300 rounded bg-white"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Signed on: {format(new Date(invoice.signature_date || invoice.admin_signature.timestamp), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
            </div>
          )}

          {invoice.description && (
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-1">Description</h3>
              <p className="text-sm text-gray-700">{invoice.description}</p>
            </div>
          )}

          {invoice.line_items && (
            <div>
              <h3 className="font-semibold text-sm text-gray-600 mb-2">Line Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-right">Quantity</th>
                      <th className="px-3 py-2 text-right">Rate</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.line_items.map((item: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: invoice.currency || 'USD',
                          }).format(item.rate)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: invoice.currency || 'USD',
                          }).format(item.quantity * item.rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
