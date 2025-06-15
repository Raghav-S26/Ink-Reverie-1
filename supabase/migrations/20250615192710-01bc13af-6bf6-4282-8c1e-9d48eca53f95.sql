
-- Drop all existing RLS policies on the 'poems' table to avoid conflicts.
DROP POLICY IF EXISTS "Allow public read access to approved poems" ON public.poems;
DROP POLICY IF EXISTS "Allow authenticated users to insert poems" ON public.poems;
DROP POLICY IF EXISTS "Allow users to update their own poems" ON public.poems;
DROP POLICY IF EXISTS "Allow users to delete their own poems" ON public.poems;
DROP POLICY IF EXISTS "Allow admins full access to poems" ON public.poems;

-- Create new, consolidated RLS policies for the 'poems' table.

-- 1. SELECT Policy: Public can view 'approved' poems, and admins can view all poems.
CREATE POLICY "Poems: Public can view approved, admins can view all"
ON public.poems
FOR SELECT
USING (
    status = 'approved' OR public.get_user_role(auth.uid()) = 'admin'
);

-- 2. INSERT Policy: Authenticated users can insert their own poems, which are automatically approved. Admins can insert any poem.
CREATE POLICY "Poems: Users and admins can insert"
ON public.poems
FOR INSERT
WITH CHECK (
    (auth.uid() = user_id AND status = 'approved')
    OR
    (public.get_user_role(auth.uid()) = 'admin')
);

-- 3. UPDATE Policy: Users can update their own poems, and admins can update any poem.
CREATE POLICY "Poems: Users can update their own, admins can update any"
ON public.poems
FOR UPDATE
USING (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
)
WITH CHECK (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
);

-- 4. DELETE Policy: Users can delete their own poems, and admins can delete any poem.
CREATE POLICY "Poems: Users can delete their own, admins can delete any"
ON public.poems
FOR DELETE
USING (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
);
