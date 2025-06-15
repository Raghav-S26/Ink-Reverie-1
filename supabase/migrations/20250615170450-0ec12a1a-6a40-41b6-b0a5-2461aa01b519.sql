
-- This function checks a user's role from the public.profiles table.
-- We use SECURITY DEFINER to allow this function to bypass RLS on the profiles table, ensuring it can always check the role.
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role text;
BEGIN
    SELECT "role" INTO v_role FROM profiles WHERE id = p_user_id;
    RETURN v_role;
END;
$$;

-- Enable Row Level Security on the 'poems' table to control access.
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Allow everyone to view poems that are marked as 'approved'.
CREATE POLICY "Allow public read access to approved poems"
ON public.poems
FOR SELECT
USING (status = 'approved');

-- 2. Policy: Allow any logged-in user to create a new poem.
CREATE POLICY "Allow authenticated users to insert poems"
ON public.poems
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Policy: Allow users to update their own poems.
CREATE POLICY "Allow users to update their own poems"
ON public.poems
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Policy: Allow users to delete their own poems.
CREATE POLICY "Allow users to delete their own poems"
ON public.poems
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Policy: Grant admins full access to manage all poems.
CREATE POLICY "Allow admins full access to poems"
ON public.poems
FOR ALL -- This covers SELECT, INSERT, UPDATE, DELETE
USING (public.get_user_role(auth.uid()) = 'admin');

