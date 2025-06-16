
-- Create follows table for poet following functionality
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT current_timestamp,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'new_poem')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_poem_id UUID REFERENCES public.poems(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Users can view all follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_poem_id UUID DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_poem_id, related_user_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_poem_id, p_related_user_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger function for like notifications
CREATE OR REPLACE FUNCTION public.notify_poem_liked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  poem_author_id UUID;
  poem_title TEXT;
  liker_name TEXT;
BEGIN
  -- Get poem author and title
  SELECT user_id, title INTO poem_author_id, poem_title
  FROM public.poems WHERE id = NEW.poem_id;
  
  -- Get liker name
  SELECT COALESCE(full_name, username) INTO liker_name
  FROM public.profiles WHERE id = NEW.user_id;
  
  -- Don't notify if user liked their own poem
  IF poem_author_id != NEW.user_id THEN
    PERFORM public.create_notification(
      poem_author_id,
      'like',
      'Someone liked your poem!',
      liker_name || ' liked your poem "' || poem_title || '"',
      NEW.poem_id,
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for follow notifications
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Get follower name
  SELECT COALESCE(full_name, username) INTO follower_name
  FROM public.profiles WHERE id = NEW.follower_id;
  
  PERFORM public.create_notification(
    NEW.following_id,
    'follow',
    'New follower!',
    follower_name || ' started following you',
    NULL,
    NEW.follower_id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger function for new poem notifications to followers
CREATE OR REPLACE FUNCTION public.notify_followers_new_poem()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  author_name TEXT;
  follower_record RECORD;
BEGIN
  -- Only notify for approved poems
  IF NEW.status = 'approved' THEN
    -- Get author name
    SELECT COALESCE(full_name, username) INTO author_name
    FROM public.profiles WHERE id = NEW.user_id;
    
    -- Notify all followers
    FOR follower_record IN 
      SELECT follower_id FROM public.follows WHERE following_id = NEW.user_id
    LOOP
      PERFORM public.create_notification(
        follower_record.follower_id,
        'new_poem',
        'New poem from ' || author_name,
        author_name || ' published a new poem: "' || NEW.title || '"',
        NEW.id,
        NEW.user_id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_poem_vote_notify AFTER INSERT ON public.poem_votes FOR EACH ROW EXECUTE FUNCTION public.notify_poem_liked();
CREATE TRIGGER on_follow_notify AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();
CREATE TRIGGER on_poem_published_notify AFTER INSERT ON public.poems FOR EACH ROW EXECUTE FUNCTION public.notify_followers_new_poem();
