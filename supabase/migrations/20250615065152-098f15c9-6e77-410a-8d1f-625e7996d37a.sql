
-- Create a table to store client onboarding questionnaire responses
CREATE TABLE public.client_questionnaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Section 1: Basic Information
  client_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  location TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  
  -- Section 2: Business Analysis
  business_objectives TEXT NOT NULL,
  pressing_issues TEXT NOT NULL,
  current_operations TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  
  -- Section 3: Services and Goals
  desired_services TEXT[] NOT NULL, -- Array to store multiple services
  consulting_goals TEXT NOT NULL,
  improvement_areas TEXT NOT NULL,
  
  -- Status and metadata
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.client_questionnaires ENABLE ROW LEVEL SECURITY;

-- Policy for clients to insert their own questionnaire
CREATE POLICY "Clients can submit their own questionnaire" 
  ON public.client_questionnaires 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for clients to view their own questionnaire
CREATE POLICY "Clients can view their own questionnaire" 
  ON public.client_questionnaires 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for admins to view all questionnaires
CREATE POLICY "Admins can view all questionnaires" 
  ON public.client_questionnaires 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy for admins to update questionnaires (for status changes and notes)
CREATE POLICY "Admins can update questionnaires" 
  ON public.client_questionnaires 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_client_questionnaires_updated_at
  BEFORE UPDATE ON public.client_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
