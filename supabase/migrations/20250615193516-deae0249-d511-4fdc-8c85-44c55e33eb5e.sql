
-- Phase 1 of Rebuild: Clean up all historical RLS policies for the 'poems' table.

-- Dropping policies from migration 20250615143904...
DROP POLICY IF EXISTS "Public can read approved poems" ON public.poems;
DROP POLICY IF EXISTS "Users can read their own poems" ON public.poems;
DROP POLICY IF EXISTS "Users can create poems" ON public.poems;
DROP POLICY IF EXISTS "Users can update their own submitted poems" ON public.poems;

-- Dropping policies from migration 20250615170450... and 20250615180039...
DROP POLICY IF EXISTS "Allow public read access to approved poems" ON public.poems;
DROP POLICY IF EXISTS "Allow authenticated users to insert poems" ON public.poems;
DROP POLICY IF EXISTS "Allow users to update their own poems" ON public.poems;
DROP POLICY IF EXISTS "Allow users to delete their own poems" ON public.poems;
DROP POLICY IF EXISTS "Allow admins full access to poems" ON public.poems;

-- Dropping policies from previous attempt (migration 20250615192710...)
DROP POLICY IF EXISTS "Poems: Public can view approved, admins can view all" ON public.poems;
DROP POLICY IF EXISTS "Poems: Users and admins can insert" ON public.poems;
DROP POLICY IF EXISTS "Poems: Users can update their own, admins can update any" ON public.poems;
DROP POLICY IF EXISTS "Poems: Users can delete their own, admins can delete any" ON public.poems;


-- Phase 2 of Rebuild: Create a single, definitive set of RLS policies for the 'poems' table.

-- 1. SELECT Policy: Public can view 'approved' poems. Authenticated users can see their own poems regardless of status. Admins can view all poems.
CREATE POLICY "Poems: Read access control"
ON public.poems
FOR SELECT
USING (
    (status = 'approved')
    OR (auth.uid() = user_id)
    OR (public.get_user_role(auth.uid()) = 'admin')
);

-- 2. INSERT Policy: Authenticated users can insert their own poems, which are auto-approved. Admins can insert any poem with any status.
CREATE POLICY "Poems: Insert access control"
ON public.poems
FOR INSERT
WITH CHECK (
    (auth.uid() = user_id AND status = 'approved')
    OR
    (public.get_user_role(auth.uid()) = 'admin')
);

-- 3. UPDATE Policy: Users can update their own poems. Admins can update any poem.
CREATE POLICY "Poems: Update access control"
ON public.poems
FOR UPDATE
USING (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
)
WITH CHECK (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
);

-- 4. DELETE Policy: Users can delete their own poems. Admins can delete any poem.
CREATE POLICY "Poems: Delete access control"
ON public.poems
FOR DELETE
USING (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
);
