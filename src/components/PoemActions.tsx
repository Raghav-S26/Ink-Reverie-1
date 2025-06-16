
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Trash2 } from "lucide-react";
import { motion, useAnimate } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PoemActionsProps {
  poemId: string;
  userHasVoted: boolean;
  votes: number;
  onRefetch: () => void;
  onDelete?: () => void;
}

const PoemActions = ({ 
  poemId, 
  userHasVoted, 
  votes, 
  onRefetch, 
  onDelete 
}: PoemActionsProps) => {
  const { session, profile } = useAuth();
  const [scope, animate] = useAnimate();
  const [likeLoading, setLikeLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    if (!session?.user) {
      toast.error("You need to be logged in to like poems.");
      return;
    }

    animate(scope.current, { scale: [1, 1.3, 1] }, { duration: 0.3 });
    setLikeLoading(true);

    if (userHasVoted) {
      const { error } = await supabase
        .from('poem_votes')
        .delete()
        .match({ poem_id: poemId, user_id: session.user.id });
      
      if (error) {
        toast.error("Failed to unlike poem: " + error.message);
      } else {
        toast.success("Unliked!");
      }
    } else {
      const { error } = await supabase
        .from('poem_votes')
        .insert({ poem_id: poemId, user_id: session.user.id });

      if (error) {
        toast.error("Failed to like poem: " + error.message);
      } else {
        toast.success("Liked! ❤️");
      }
    }
    setLikeLoading(false);
    onRefetch();
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
    setShareLoading(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from("poems").delete().eq("id", poemId);

    if (error) {
      toast.error("Failed to delete poem: " + error.message);
      setIsDeleting(false);
    } else {
      toast.success("Poem deleted successfully.");
      onDelete?.();
    }
  };

  return (
    <div className="mt-12 pt-8 border-t flex flex-wrap items-center gap-4">
      <Button 
        variant={userHasVoted ? "secondary" : "outline"}
        className="flex items-center gap-2" 
        onClick={handleLike}
        disabled={likeLoading || !session}
        title={!session ? "You must be logged in to like poems" : ""}
      >
        <span ref={scope}>
          <Heart className={`h-5 w-5 text-pink-500 transition-colors ${userHasVoted ? 'fill-current' : ''}`} />
        </span>
        {likeLoading ? "..." : <>{userHasVoted ? 'Unlike' : 'Like'} ({votes})</>}
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={handleShare}
        disabled={shareLoading}
      >
        <Share2 className="h-5 w-5 text-gray-500" /> 
        {shareLoading ? "Sharing..." : "Share"}
      </Button>
      
      <Button variant="outline" className="flex items-center gap-2" disabled>
        <MessageSquare className="h-5 w-5 text-brand-indigo" /> Comment
      </Button>

      {profile?.role === 'admin' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 />
              Delete Poem
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                poem from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Yes, delete poem"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default PoemActions;
