
-- Create invoices table to store billing information
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_at TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  line_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table to track payment history
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'bank_transfer', 'paypal', 'stripe', 'cash')),
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices table
-- Clients can view their own invoices
CREATE POLICY "Clients can view their own invoices"
  ON public.invoices FOR SELECT
  USING (client_id = auth.uid());

-- Consultants can view invoices for their services
CREATE POLICY "Consultants can view their invoices"
  ON public.invoices FOR SELECT
  USING (consultant_id = auth.uid());

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices"
  ON public.invoices FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert invoices
CREATE POLICY "Admins can create invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update invoices
CREATE POLICY "Admins can update invoices"
  ON public.invoices FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments table
-- Clients can view their own payments
CREATE POLICY "Clients can view their own payments"
  ON public.payments FOR SELECT
  USING (client_id = auth.uid());

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert payments
CREATE POLICY "Admins can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update payments
CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_consultant_id ON public.invoices(consultant_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_issued_at ON public.invoices(issued_at);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_client_id ON public.payments(client_id);
CREATE INDEX idx_payments_processed_at ON public.payments(processed_at);

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  sequence_num TEXT;
BEGIN
  -- Get the next sequence number for this year
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO sequence_num
  FROM public.invoices
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  RETURN 'INV-' || current_year || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;
