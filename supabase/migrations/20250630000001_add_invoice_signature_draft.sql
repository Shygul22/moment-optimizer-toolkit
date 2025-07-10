
-- Add columns for e-signature and draft functionality to invoices table
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS admin_signature JSONB;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS signature_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS signed_by UUID REFERENCES auth.users(id);

-- Update the status check constraint to include 'draft'
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check 
  CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled'));

-- Create index for draft invoices
CREATE INDEX IF NOT EXISTS idx_invoices_is_draft ON public.invoices(is_draft);
