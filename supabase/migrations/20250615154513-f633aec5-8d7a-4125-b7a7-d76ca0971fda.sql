
UPDATE public.poems
SET status = 'approved'
WHERE status = 'submitted' AND user_id = auth.uid();
