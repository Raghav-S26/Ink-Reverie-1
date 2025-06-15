
-- Phase 1: Backend Infrastructure Setup

-- 1. Create site_settings table for global configuration
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'Poetrica',
  site_description TEXT NOT NULL DEFAULT 'Where Words Find Their Stage.',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and allow public read access
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);

-- Insert initial site settings
INSERT INTO public.site_settings (id, site_name, site_description) VALUES (1, 'Poetrica', 'A vibrant community of poets.');


-- 2. Create profiles table for user-specific data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 3. Create function and trigger to populate profiles on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.email, -- Use email as initial username
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 4. Create contests table
CREATE TABLE public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  prize TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for contests
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read contests" ON public.contests FOR SELECT USING (true);


-- 5. Create poems table
CREATE TABLE public.poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES public.contests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  votes INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for poems
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read approved poems" ON public.poems FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can read their own poems" ON public.poems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create poems" ON public.poems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own submitted poems" ON public.poems FOR UPDATE USING (auth.uid() = user_id AND status = 'submitted');
