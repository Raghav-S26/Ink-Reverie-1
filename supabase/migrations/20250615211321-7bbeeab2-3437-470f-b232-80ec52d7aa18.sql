
-- Function to get all approved poems with their author's name for public display
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

-- Function to get the details for a single poem, including if the current user has voted
-- This respects RLS: users can see approved poems, their own poems, or all if they are admin.
CREATE OR REPLACE FUNCTION public.get_public_poem_details(p_poem_id UUID)
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
DECLARE
  v_user_id UUID := auth.uid();
  v_is_admin BOOLEAN := public.get_user_role(v_user_id) = 'admin';
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
            WHERE pv.poem_id = p.id AND pv.user_id = v_user_id
        ) as user_has_voted
    FROM
        public.poems p
    JOIN
        public.profiles pr ON p.user_id = pr.id
    WHERE
        p.id = p_poem_id AND (p.status = 'approved' OR p.user_id = v_user_id OR v_is_admin);
END;
$$;
