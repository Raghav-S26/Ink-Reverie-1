
-- 1. Profiles Table & Related Functions
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT current_timestamp,
  updated_at TIMESTAMPTZ DEFAULT current_timestamp
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on new user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Policies for Profiles
DROP POLICY IF EXISTS "Public: can read profiles" ON public.profiles;
CREATE POLICY "Public: can read profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "User: can update own profile" ON public.profiles;
CREATE POLICY "User: can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Helper function to get a user's role (must exist before policies use it)
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = p_user_id;
  RETURN v_role;
END;
$$;

-- 3. Poems Table
CREATE TABLE IF NOT EXISTS public.poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES public.contests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  votes INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT current_timestamp
);
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;

-- Policies for Poems
DROP POLICY IF EXISTS "Poems: read approved and own" ON public.poems;
CREATE POLICY "Poems: read approved and own" ON public.poems FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
DROP POLICY IF EXISTS "Poems: insert own" ON public.poems;
CREATE POLICY "Poems: insert own" ON public.poems FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Poems: update own" ON public.poems;
CREATE POLICY "Poems: update own" ON public.poems FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Poems: delete own" ON public.poems;
CREATE POLICY "Poems: delete own" ON public.poems FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Poems: Admin full access" ON public.poems;
CREATE POLICY "Poems: Admin full access" ON public.poems FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin');

-- 4. Poem Votes Table
CREATE TABLE IF NOT EXISTS public.poem_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT current_timestamp,
  UNIQUE(poem_id, user_id)
);
ALTER TABLE public.poem_votes ENABLE ROW LEVEL SECURITY;

-- Policies for Votes
DROP POLICY IF EXISTS "Vote: users can manage own votes" ON public.poem_votes;
CREATE POLICY "Vote: users can manage own votes" ON public.poem_votes FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Vote: all can read votes" ON public.poem_votes;
CREATE POLICY "Vote: all can read votes" ON public.poem_votes FOR SELECT USING (true);

-- Vote counter functions and triggers
CREATE OR REPLACE FUNCTION public.increment_poem_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.poems SET votes = votes + 1 WHERE id = NEW.poem_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION public.decrement_poem_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.poems SET votes = votes - 1 WHERE id = OLD.poem_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_poem_vote_created ON public.poem_votes;
CREATE TRIGGER on_poem_vote_created AFTER INSERT ON public.poem_votes FOR EACH ROW EXECUTE PROCEDURE public.increment_poem_votes();
DROP TRIGGER IF EXISTS on_poem_vote_deleted ON public.poem_votes;
CREATE TRIGGER on_poem_vote_deleted AFTER DELETE ON public.poem_votes FOR EACH ROW EXECUTE PROCEDURE public.decrement_poem_votes();

-- 5. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT current_timestamp
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies for Comments
DROP POLICY IF EXISTS "Comments: read all" ON public.comments;
CREATE POLICY "Comments: read all" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Comments: manage own" ON public.comments;
CREATE POLICY "Comments: manage own" ON public.comments FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Comments: admin full access" ON public.comments;
CREATE POLICY "Comments: admin full access" ON public.comments FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin');

-- 6. Policies for existing Contests table
DROP POLICY IF EXISTS "Contests: admin CRUD" ON public.contests;
CREATE POLICY "Contests: admin CRUD" ON public.contests FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin');

-- 7. Storage Bucket for Avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage
DROP POLICY IF EXISTS "Avatars: public read" ON storage.objects;
CREATE POLICY "Avatars: public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Avatars: user can upload own" ON storage.objects;
CREATE POLICY "Avatars: user can upload own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
DROP POLICY IF EXISTS "Avatars: user can update own" ON storage.objects;
CREATE POLICY "Avatars: user can update own" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);
DROP POLICY IF EXISTS "Avatars: user can delete own" ON storage.objects;
CREATE POLICY "Avatars: user can delete own" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

