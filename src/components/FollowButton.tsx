
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserPlus, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  authorId: string;
  authorName: string;
}

const FollowButton = ({ authorId, authorName }: FollowButtonProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: isFollowing = false, isLoading } = useQuery({
    queryKey: ['following', session?.user?.id, authorId],
    queryFn: async () => {
      if (!session?.user?.id || session.user.id === authorId) return false;
      
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', session.user.id)
        .eq('following_id', authorId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!session?.user?.id && session.user.id !== authorId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', authorId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: session.user.id,
            following_id: authorId,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast.success(isFollowing ? `Unfollowed ${authorName}` : `Now following ${authorName}`);
    },
    onError: (error) => {
      toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'}: ${error.message}`);
    },
  });

  if (!session || session.user.id === authorId) return null;

  return (
    <Button
      variant={isFollowing ? "secondary" : "outline"}
      size="sm"
      onClick={() => followMutation.mutate()}
      disabled={isLoading || followMutation.isPending}
      className="flex items-center gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
