
-- Phase 1: Clean Slate - Drop all RLS policies on 'poems' table to ensure a fresh start.
DROP POLICY IF EXISTS "Poems: Read access control" ON public.poems;
DROP POLICY IF EXISTS "Poems: Insert access control" ON public.poems;
DROP POLICY IF EXISTS "Poems: Update access control" ON public.poems;
DROP POLICY IF EXISTS "Poems: Delete access control" ON public.poems;
DROP POLICY IF EXISTS "Public can read approved poems" ON public.poems;
DROP POLICY IF EXISTS "Users can read their own poems" ON public.poems;
DROP POLICY IF EXISTS "Users can create poems" ON public.poems;
DROP POLICY IF EXISTS "Users can update their own submitted poems" ON public.poems;
DROP POLICY IF EXISTS "Allow public read access to approved poems" ON public.poems;
DROP POLICY IF EXISTS "Allow authenticated users to insert poems" ON public.poems;
DROP POLICY IF EXISTS "Allow users to update their own poems" ON public.poems;
DROP POLICY IF EXISTS "Allow users to delete their own poems" ON public.poems;
DROP POLICY IF EXISTS "Allow admins full access to poems" ON public.poems;
DROP POLICY IF EXISTS "Poems: Public can view approved, admins can view all" ON public.poems;
DROP POLICY IF EXISTS "Poems: Users and admins can insert" ON public.poems;
DROP POLICY IF EXISTS "Poems: Users can update their own, admins can update any" ON public.poems;
DROP POLICY IF EXISTS "Poems: Users can delete their own, admins can delete any" ON public.poems;

-- Phase 2: Create new, simplified RLS policies for 'poems' table.

-- 1. SELECT Policy: Public can view 'approved' poems. Users can also see their own poems.
CREATE POLICY "Poems: Read access"
ON public.poems
FOR SELECT
USING (
    (status = 'approved') OR (auth.uid() = user_id)
);

-- 2. INSERT Policy: Authenticated users can insert poems for themselves. This is the key fix.
CREATE POLICY "Poems: Insert access"
ON public.poems
FOR INSERT
WITH CHECK (
    auth.uid() = user_id
);

-- 3. UPDATE Policy: Users can update their own poems.
CREATE POLICY "Poems: Update access"
ON public.poems
FOR UPDATE
USING (
    auth.uid() = user_id
)
WITH CHECK (
    auth.uid() = user_id
);

-- 4. DELETE Policy: Users can delete their own poems.
CREATE POLICY "Poems: Delete access"
ON public.poems
FOR DELETE
USING (
    auth.uid() = user_id
);

-- Phase 3: Add a separate, explicit policy for Admin access.
-- This keeps admin logic separate and prevents it from interfering with regular user actions.
CREATE POLICY "Poems: Admin full access"
ON public.poems
FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
