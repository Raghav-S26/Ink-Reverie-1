
-- Function to get all approved poems with their author's name
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

-- Function to get the details for a single approved poem
CREATE OR REPLACE FUNCTION public.get_public_poem_details(poem_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    votes INT,
    submitted_at TIMESTAMPTZ,
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
        p.submitted_at,
        COALESCE(pr.full_name, pr.username) as author_name,
        pr.avatar_url as author_avatar_url
    FROM
        public.poems p
    JOIN
        public.profiles pr ON p.user_id = pr.id
    WHERE
        p.id = poem_id AND p.status = 'approved';
END;
$$;
