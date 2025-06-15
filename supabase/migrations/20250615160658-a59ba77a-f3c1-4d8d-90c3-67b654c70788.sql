
-- Create a table to track individual votes if it doesn't exist
CREATE TABLE IF NOT EXISTS public.poem_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(poem_id, user_id)
);

-- Enable Row Level Security on the new table
-- This statement is safe to re-run
ALTER TABLE public.poem_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors on re-run
DROP POLICY IF EXISTS "Users can vote on poems" ON public.poem_votes;
DROP POLICY IF EXISTS "Users can see their own votes" ON public.poem_votes;
DROP POLICY IF EXISTS "Users can remove their own votes" ON public.poem_votes;

-- Allow users to insert, view, and delete their own votes
CREATE POLICY "Users can vote on poems"
ON public.poem_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see their own votes"
ON public.poem_votes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
ON public.poem_votes FOR DELETE
USING (auth.uid() = user_id);

-- Create a function to automatically increase the vote count on the poems table
CREATE OR REPLACE FUNCTION public.increment_poem_votes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.poems
    SET votes = votes + 1
    WHERE id = NEW.poem_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to automatically decrease the vote count on the poems table
CREATE OR REPLACE FUNCTION public.decrement_poem_votes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.poems
    SET votes = votes - 1
    WHERE id = OLD.poem_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers to avoid errors
DROP TRIGGER IF EXISTS on_poem_vote_created ON public.poem_votes;
DROP TRIGGER IF EXISTS on_poem_vote_deleted ON public.poem_votes;

-- Create triggers to run the functions when a vote is cast or removed
CREATE TRIGGER on_poem_vote_created
AFTER INSERT ON public.poem_votes
FOR EACH ROW EXECUTE PROCEDURE public.increment_poem_votes();

CREATE TRIGGER on_poem_vote_deleted
AFTER DELETE ON public.poem_votes
FOR EACH ROW EXECUTE PROCEDURE public.decrement_poem_votes();

-- Drop the old function before recreating it with a new return type
DROP FUNCTION IF EXISTS public.get_public_poem_details(UUID);

-- Create the function that gets poem details to also check if the current user has voted
CREATE FUNCTION public.get_public_poem_details(poem_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    votes INT,
    submitted_at TIMESTAMPTZ,
    author_name TEXT,
    author_avatar_url TEXT,
    user_has_voted BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title,
        p.content,
        p.category,
        p.votes,
        p.submitted_at,
        COALESCE(pr.full_name, pr.username) as author_name,
        pr.avatar_url as author_avatar_url,
        EXISTS (
            SELECT 1
            FROM public.poem_votes pv
            WHERE pv.poem_id = p.id AND pv.user_id = auth.uid()
        ) as user_has_voted
    FROM
        public.poems p
    JOIN
        public.profiles pr ON p.user_id = pr.id
    WHERE
        p.id = poem_id AND p.status = 'approved';
END;
$$;
