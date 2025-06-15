
-- Set the default status of new poems to 'approved'
ALTER TABLE public.poems ALTER COLUMN status SET DEFAULT 'approved';

-- Update RLS policy so authenticated users can insert with status 'approved'
DROP POLICY IF EXISTS "Allow authenticated users to insert poems" ON public.poems;

CREATE POLICY "Allow authenticated users to insert poems"
ON public.poems
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND (status IS NULL OR status = 'approved' OR (status = 'submitted' AND public.get_user_role(auth.uid()) = 'admin'))
);
