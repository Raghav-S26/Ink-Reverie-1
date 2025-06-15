
-- Phase 1: Clean slate. Drop poems and related tables/functions.
-- CASCADE will handle dependent objects like triggers, functions, and foreign key constraints.
DROP TABLE IF EXISTS public.poem_votes CASCADE;
DROP TABLE IF EXISTS public.poems CASCADE;

-- Phase 2: Recreate poems table.
CREATE TABLE public.poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES public.contests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('submitted', 'approved', 'rejected')),
  votes INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 3: Recreate RLS policies for poems.
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Poems: Read access control"
ON public.poems
FOR SELECT
USING (
    (status = 'approved')
    OR (auth.uid() = user_id)
    OR (public.get_user_role(auth.uid()) = 'admin')
);

CREATE POLICY "Poems: Insert access control"
ON public.poems
FOR INSERT
WITH CHECK (
    (auth.uid() = user_id AND status = 'approved')
    OR
    (public.get_user_role(auth.uid()) = 'admin')
);

CREATE POLICY "Poems: Update access control"
ON public.poems
FOR UPDATE
USING (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
)
WITH CHECK (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Poems: Delete access control"
ON public.poems
FOR DELETE
USING (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
);


-- Phase 4: Recreate poem_votes table and its policies/triggers.
CREATE TABLE public.poem_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poem_id UUID NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(poem_id, user_id)
);

ALTER TABLE public.poem_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote on poems"
ON public.poem_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see their own votes"
ON public.poem_votes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
ON public.poem_votes FOR DELETE
USING (auth.uid() = user_id);


-- Phase 5: Recreate vote counting functions and triggers
CREATE OR REPLACE FUNCTION public.increment_poem_votes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.poems
    SET votes = votes + 1
    WHERE id = NEW.poem_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_poem_votes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.poems
    SET votes = votes - 1
    WHERE id = OLD.poem_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_poem_vote_created
AFTER INSERT ON public.poem_votes
FOR EACH ROW EXECUTE PROCEDURE public.increment_poem_votes();

CREATE TRIGGER on_poem_vote_deleted
AFTER DELETE ON public.poem_votes
FOR EACH ROW EXECUTE PROCEDURE public.decrement_poem_votes();


-- Phase 6: Recreate helper functions for fetching poems.
CREATE OR REPLACE FUNCTION public.get_public_poems_with_authors()
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    votes INT,
    author_name TEXT,
    author_avatar_url TEXT
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
        COALESCE(pr.full_name, pr.username) as author_name,
        pr.avatar_url as author_avatar_url
    FROM
        public.poems p
    JOIN
        public.profiles pr ON p.user_id = pr.id
    WHERE
        p.status = 'approved'
    ORDER BY
        p.submitted_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_poem_details(poem_id UUID)
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
