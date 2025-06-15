
-- This migration enables auto-approval for newly submitted poems.

-- 1. Change the default status for new poems from 'submitted' to 'approved'.
ALTER TABLE public.poems ALTER COLUMN status SET DEFAULT 'approved';

-- 2. Update the row-level security policy for inserting poems.
-- First, drop the existing policy which is now outdated.
DROP POLICY IF EXISTS "Poems: insert own" ON public.poems;

-- Create a new policy that allows users to insert their own poems,
-- which will now default to 'approved' status. We check for status = 'approved'
-- or status IS NULL to allow the database default to be applied correctly.
-- The "Poems: Admin full access" policy will still cover admins for any status.
CREATE POLICY "Poems: user can insert approved poems"
ON public.poems
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (status IS NULL OR status = 'approved')
);

