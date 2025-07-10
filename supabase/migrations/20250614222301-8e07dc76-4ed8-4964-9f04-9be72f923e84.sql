
-- Create client_todos table for storing client meeting notes and tasks
CREATE TABLE public.client_todos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_todos ENABLE ROW LEVEL SECURITY;

-- Create policies for client_todos
CREATE POLICY "Users can view their own todos" 
  ON public.client_todos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" 
  ON public.client_todos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" 
  ON public.client_todos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" 
  ON public.client_todos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_todos_updated_at 
  BEFORE UPDATE ON public.client_todos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
