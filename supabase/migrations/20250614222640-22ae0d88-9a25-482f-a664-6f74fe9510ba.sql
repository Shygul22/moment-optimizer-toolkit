
-- Fix the generate_invoice_number function to have a secure search path
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
$$;

-- Fix the update_updated_at_column function to have a secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
