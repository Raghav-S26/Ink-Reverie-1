
import { Tables } from '@/integrations/supabase/types';

export type PoemWithAuthor = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  votes: number;
  author_name: string | null;
  author_avatar_url: string | null;
};

export type PoemDetailData = PoemWithAuthor & {
  submitted_at: string | null;
  user_has_voted: boolean;
};

export type Contest = Tables<'contests'>;
