import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ESignature } from './ESignature';
import { toast } from 'sonner';
import { FileText, Save, Send, Edit, Heart } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  is_draft: boolean;
  admin_signature?: any;
  signature_date?: string;
  signed_by?: string;
  client?: { full_name?: string };
  consultant?: { full_name?: string };
}

interface InvoiceDraftManagerProps {
  invoice: Invoice;
  onSuccess?: () => void;
}

export const InvoiceDraftManager = ({ invoice, onSuccess }: InvoiceDraftManagerProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      console.log('Saving draft for invoice:', invoice.id);
      
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          is_draft: true,
          status: 'pending' // Keep as pending for drafts
        })
        .eq('id', invoice.id)
        .select()
        .single();

      if (error) {
        console.error('Save draft error:', error);
        throw error;
      }
      
      console.log('Draft saved successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Draft saved successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft: ' + (error?.message || 'Unknown error'));
    },
  });

  const signAndFinalizeMutation = useMutation({
    mutationFn: async () => {
      if (!signatureData) {
        throw new Error('Please provide a signature before finalizing');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Signing invoice:', invoice.id, 'with user:', user.id);

      const signaturePayload = {
        data: signatureData,
        timestamp: new Date().toISOString(),
        admin_id: user.id,
      };

      const { data, error } = await supabase
        .from('invoices')
        .update({
          is_draft: false,
          status: 'pending',
          admin_signature: signaturePayload,
          signature_date: new Date().toISOString(),
          signed_by: user.id,
        })
        .eq('id', invoice.id)
        .select()
        .single();

      if (error) {
        console.error('Signature error:', error);
        throw error;
      }

      console.log('Invoice signed successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Invoice signed and finalized successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowSignatureModal(false);
      setSignatureData('');
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Failed to sign invoice:', error);
      toast.error('Failed to sign invoice: ' + (error?.message || 'Unknown error'));
    },
  });

  const handleSignature = (signature: string) => {
    console.log('Signature received, length:', signature?.length || 0);
    
    if (!signature || signature.length === 0) {
      toast.error('Please draw a signature before saving');
      return;
    }
    
    setSignatureData(signature);
    signAndFinalizeMutation.mutate();
  };

  const handleSaveDraft = () => {
    console.log('Save draft clicked for invoice:', invoice.id);
    saveDraftMutation.mutate();
  };

  const handleSignAndFinalize = () => {
    console.log('Sign and finalize clicked for invoice:', invoice.id);
    setShowSignatureModal(true);
  };

  return (
    <>
      <Card className="border-l-4 border-l-therapy-blue bg-gradient-to-br from-card to-warm-sage/20 shadow-calming hover:shadow-therapy transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-trust-navy">
              <Heart className="h-5 w-5 text-calming-green" />
              Invoice {invoice.invoice_number}
            </CardTitle>
            <div className="flex gap-2">
              {invoice.is_draft && (
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors">
                  Draft
                </Badge>
              )}
              {invoice.admin_signature && (
                <Badge variant="outline" className="text-calming-green border-calming-green bg-green-50 hover:bg-green-100 transition-colors">
                  Signed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-warm-sage/30 border border-calming-green/20">
              <span className="text-muted-foreground block mb-1">Client:</span>
              <div className="font-medium text-trust-navy">{invoice.client?.full_name || 'Unknown'}</div>
            </div>
            <div className="p-3 rounded-lg bg-warm-sage/30 border border-calming-green/20">
              <span className="text-muted-foreground block mb-1">Amount:</span>
              <div className="font-medium text-trust-navy">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: invoice.currency || 'INR',
                }).format(invoice.amount)}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {invoice.is_draft ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={saveDraftMutation.isPending}
                  className="border-healing-teal text-healing-teal hover:bg-healing-teal hover:text-white transition-all duration-200"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saveDraftMutation.isPending ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSignAndFinalize}
                  disabled={signAndFinalizeMutation.isPending}
                  className="bg-therapy-gradient hover:opacity-90 text-white shadow-calming transition-all duration-200"
                >
                  <Send className="h-4 w-4 mr-1" />
                  {signAndFinalizeMutation.isPending ? 'Signing...' : 'Sign & Finalize'}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSignatureModal(true)}
                disabled={!!invoice.admin_signature}
                className="border-calming-green text-calming-green hover:bg-calming-green hover:text-white transition-all duration-200"
              >
                {invoice.admin_signature ? (
                  <>
                    <FileText className="h-4 w-4 mr-1" />
                    View Signature
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1" />
                    Add Signature
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-card to-warm-sage/10 border-calming-green/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-trust-navy">
              <Heart className="h-5 w-5 text-calming-green" />
              {invoice.admin_signature ? 'View Signature' : 'Sign Invoice'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {invoice.admin_signature 
                ? 'View the existing signature for this invoice.' 
                : 'Draw your signature to finalize this invoice with care and professionalism.'
              }
            </DialogDescription>
          </DialogHeader>
          <ESignature
            onSignature={handleSignature}
            existingSignature={invoice.admin_signature}
            isReadOnly={!!invoice.admin_signature}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
