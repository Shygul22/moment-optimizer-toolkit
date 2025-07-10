
-- First, let's update the invoices table to reference profiles instead of auth.users
ALTER TABLE public.invoices 
DROP CONSTRAINT invoices_client_id_fkey,
DROP CONSTRAINT invoices_consultant_id_fkey;

ALTER TABLE public.invoices 
ADD CONSTRAINT invoices_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT invoices_consultant_id_fkey 
FOREIGN KEY (consultant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update the payments table to reference profiles instead of auth.users
ALTER TABLE public.payments 
DROP CONSTRAINT payments_client_id_fkey;

ALTER TABLE public.payments 
ADD CONSTRAINT payments_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
