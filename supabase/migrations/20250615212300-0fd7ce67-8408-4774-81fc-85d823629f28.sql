
-- Allow all users to view contests
CREATE POLICY "Public: can read contests" ON public.contests FOR SELECT USING (true);
