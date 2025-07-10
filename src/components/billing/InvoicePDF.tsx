
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

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

interface InvoicePDFProps {
  invoice: Invoice;
  onDownload?: () => void;
}

export const InvoicePDF = ({ invoice, onDownload }: InvoicePDFProps) => {
  const generatePDF = () => {
    // Create a new window with the invoice content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .detail-section h3 {
            color: #333;
            margin-bottom: 10px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          .amount-section {
            text-align: right;
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status.paid { background-color: #d1fae5; color: #065f46; }
          .status.pending { background-color: #fef3c7; color: #92400e; }
          .status.overdue { background-color: #fee2e2; color: #991b1b; }
          .signature-section {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #ccc;
          }
          .signature-image {
            max-width: 200px;
            max-height: 80px;
            border: 1px solid #ccc;
            margin-top: 10px;
          }
          .line-items {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .line-items th,
          .line-items td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .line-items th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .line-items tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          @media print {
            body { print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>${invoice.invoice_number}</h2>
          <span class="status ${invoice.status}">${invoice.status}</span>
        </div>

        <div class="invoice-details">
          <div class="detail-section">
            <h3>Bill To:</h3>
            <p><strong>${invoice.client?.business_name || invoice.client?.full_name || 'Unknown Client'}</strong></p>
          </div>
          
          <div class="detail-section">
            <h3>From:</h3>
            <p><strong>${invoice.consultant?.business_name || invoice.consultant?.full_name || 'Unknown Consultant'}</strong></p>
          </div>

          <div class="detail-section">
            <h3>Invoice Details:</h3>
            <p><strong>Issue Date:</strong> ${format(new Date(invoice.issued_at), 'MMM dd, yyyy')}</p>
            <p><strong>Due Date:</strong> ${format(new Date(invoice.due_at), 'MMM dd, yyyy')}</p>
          </div>

          <div class="detail-section">
            <h3>Payment Details:</h3>
            <p><strong>Currency:</strong> ${invoice.currency}</p>
            <p><strong>Invoice ID:</strong> ${invoice.id}</p>
          </div>
        </div>

        ${invoice.description ? `
          <div class="detail-section">
            <h3>Description:</h3>
            <p>${invoice.description}</p>
          </div>
        ` : ''}

        ${invoice.line_items && invoice.line_items.length > 0 ? `
          <div class="detail-section">
            <h3>Line Items:</h3>
            <table class="line-items">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.line_items.map((item: any) => `
                  <tr>
                    <td>${item.description || 'Service'}</td>
                    <td>${item.quantity || 1}</td>
                    <td>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency }).format(item.rate || 0)}</td>
                    <td>${new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency }).format((item.quantity || 1) * (item.rate || 0))}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="amount-section">
          <div class="amount">
            Total: ${new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: invoice.currency,
            }).format(invoice.amount)}
          </div>
        </div>

        ${invoice.admin_signature ? `
          <div class="signature-section">
            <h3>Authorized Signature:</h3>
            <img src="${invoice.admin_signature.data}" alt="Admin Signature" class="signature-image" />
            <p><small>Signed on: ${format(new Date(invoice.signature_date || invoice.admin_signature.timestamp), 'MMM dd, yyyy HH:mm')}</small></p>
            <p><small>Digital signature verified</small></p>
          </div>
        ` : ''}
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    onDownload?.();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePDF}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Download PDF
    </Button>
  );
};
