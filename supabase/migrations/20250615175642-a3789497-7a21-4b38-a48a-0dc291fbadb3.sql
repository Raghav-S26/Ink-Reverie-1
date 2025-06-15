
-- Phase 1: Critical RLS Policy Fixes

-- 1. Secure the 'comments' table: 
--    - Only authenticated users can insert comments for themselves.
--    - Only users can update/delete their own comments.
--    - Public can SELECT comments (for display).

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to select comments" ON public.comments;
CREATE POLICY "Allow public to select comments"
ON public.comments
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated can insert own comments" ON public.comments;
CREATE POLICY "Authenticated can insert own comments"
ON public.comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments"
ON public.comments
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Secure the 'contests' table:
--    - Public may SELECT/view contests
--    - Only admins can INSERT/UPDATE/DELETE contests
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read contests" ON public.contests;
CREATE POLICY "Public can read contests"
ON public.contests
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can insert contests" ON public.contests;
CREATE POLICY "Admins can insert contests"
ON public.contests
FOR INSERT
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can update contests" ON public.contests;
CREATE POLICY "Admins can update contests"
ON public.contests
FOR UPDATE
USING (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can delete contests" ON public.contests;
CREATE POLICY "Admins can delete contests"
ON public.contests
FOR DELETE
USING (public.get_user_role(auth.uid()) = 'admin');

-- 3. Secure 'site_settings' table:
--    - Public can only SELECT
--    - Only admin can UPDATE

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings"
ON public.site_settings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (public.get_user_role(auth.uid()) = 'admin');
