
-- Create table for landing page sections
CREATE TABLE public.landing_page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_type TEXT NOT NULL, -- 'hero', 'stats', 'services', 'consultants', 'blog', 'cta'
  title TEXT,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB, -- For storing additional configuration like button texts, links, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for blog posts
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID REFERENCES public.profiles(id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[],
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create table for dynamic hero content variations
CREATE TABLE public.hero_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.landing_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_variations ENABLE ROW LEVEL SECURITY;

-- Policies for landing_page_sections
CREATE POLICY "Everyone can view active landing sections" 
  ON public.landing_page_sections 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage landing sections" 
  ON public.landing_page_sections 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for blog_posts
CREATE POLICY "Everyone can view published blog posts" 
  ON public.blog_posts 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage all blog posts" 
  ON public.blog_posts 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authors can manage their own blog posts" 
  ON public.blog_posts 
  FOR ALL 
  USING (author_id = auth.uid());

-- Policies for hero_variations
CREATE POLICY "Everyone can view active hero variations" 
  ON public.hero_variations 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage hero variations" 
  ON public.hero_variations 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default hero variations
INSERT INTO public.hero_variations (title, subtitle, description, sort_order) VALUES
('Your Career, Clarity, and Confidence — Starts Here', 'Therapy for Goal-Getters, Dreamers, and Professionals on the Rise', 'Feeling stuck, overwhelmed, or unsure about your next move? Whether you''re facing burnout, decision fatigue, or struggling with time management — we''re here to help.', 1),
('Transform Your Professional Journey', 'Expert Guidance for Modern Professionals', 'Break through barriers, overcome imposter syndrome, and build the career confidence you deserve with personalized therapy sessions.', 2),
('From Burnout to Breakthrough', 'Mental Health Support That Actually Works', 'Stop feeling overwhelmed by endless tasks. Learn sustainable productivity habits and stress management techniques that last.', 3);

-- Insert default landing page sections
INSERT INTO public.landing_page_sections (section_type, title, subtitle, content, sort_order, metadata) VALUES
('stats', 'Why Thousands Trust ZenJourney', 'Real results from real people who''ve transformed their careers and found inner peace', '', 1, '{"stats": [{"number": 500, "suffix": "+", "label": "Professionals Helped", "description": "Successfully guided career transitions", "icon": "👥"}, {"number": 98, "suffix": "%", "label": "Success Rate", "description": "Clients report positive outcomes", "icon": "📈"}, {"number": 4.9, "suffix": "/5", "label": "Average Rating", "description": "Based on client reviews", "icon": "⭐"}, {"number": 24, "suffix": "h", "label": "Response Time", "description": "Average response to inquiries", "icon": "⚡"}]}'),
('blog', 'Latest Insights', 'Expert advice and insights to help you on your professional journey', '', 2, '{"show_featured_only": true, "posts_to_show": 3}'),
('cta', 'Ready to Transform Your Career?', 'Join thousands of professionals who''ve found clarity and confidence', 'Take the first step towards your breakthrough today.', 3, '{"primary_button": {"text": "Start Your Journey", "link": "/auth"}, "secondary_button": {"text": "Free Consultation", "link": "https://wa.me/919092406569"}}');

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_landing_page_sections_updated_at BEFORE UPDATE ON public.landing_page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
