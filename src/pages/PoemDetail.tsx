import { useParams, Link, useNavigate } from "react-router-dom";
import NotFound from "./NotFound";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PoemDetailData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import CommentSection from "@/components/CommentSection";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { motion, useAnimate } from "framer-motion";
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

const fetchPoem = async (id: string): Promise<PoemDetailData | null> => {
    const { data, error } = await supabase
        .rpc('get_public_poem_details', { poem_id: id })
        .single();
    if (error && error.code !== 'PGRST116') { // Ignore 'exact one row' error for not found
        throw new Error(error.message);
    }
    return data;
};


const PoemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [scope, animate] = useAnimate();

  const { data: poem, isLoading, isError, refetch } = useQuery({
    queryKey: ["poem", id],
    queryFn: () => fetchPoem(id!),
    enabled: !!id,
  });

  const [likeLoading, setLikeLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle liking a poem
  const handleLike = async () => {
    if (!session?.user) {
      toast.error("You need to be logged in to like poems.");
      return;
    }
    if (!poem) return;

    animate(scope.current, { scale: [1, 1.3, 1] }, { duration: 0.3 });
    setLikeLoading(true);

    if (poem.user_has_voted) {
      // User has already liked, so unlike it.
      const { error } = await supabase
        .from('poem_votes')
        .delete()
        .match({ poem_id: poem.id, user_id: session.user.id });
      
      if (error) {
        toast.error("Failed to unlike poem: " + error.message);
      } else {
        toast.success("Unliked!");
      }
    } else {
      // User has not liked, so like it.
      const { error } = await supabase
        .from('poem_votes')
        .insert({ poem_id: poem.id, user_id: session.user.id });

      if (error) {
        toast.error("Failed to like poem: " + error.message);
      } else {
        toast.success("Liked! ❤️");
      }
    }
    setLikeLoading(false);
    // Refetch poem data to update vote count and button state
    refetch();
  };

  // Handle sharing a poem (copy URL)
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

  // Handle deleting a poem
  const handleDelete = async () => {
    if (!poem) return;
    setIsDeleting(true);
    const { error } = await supabase.from("poems").delete().eq("id", poem.id);

    if (error) {
      toast.error("Failed to delete poem: " + error.message);
      setIsDeleting(false);
    } else {
      toast.success("Poem deleted successfully.");
      navigate("/poems");
    }
  };

  if (isLoading) {
      return (
          <div className="max-w-4xl mx-auto space-y-8">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-96 w-full" />
          </div>
      )
  }

  if (isError || !poem) {
    return <NotFound />;
  }

  const { title, author_name, author_avatar_url, content, category, submitted_at, votes, user_has_voted } = poem;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 p-8">
          {category && <Badge variant="secondary" className="w-fit">{category}</Badge>}
          <h1 className="font-serif text-4xl md:text-5xl font-bold mt-4">{title}</h1>
          <div className="flex items-center gap-4 mt-4">
            <Avatar>
              <AvatarImage src={author_avatar_url || undefined} alt={author_name || 'Anonymous'} />
              <AvatarFallback>{author_name?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{author_name || 'Anonymous'}</p>
              {submitted_at && <p className="text-sm text-gray-500">Published on {new Date(submitted_at).toLocaleDateString()}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div 
            className="prose prose-lg max-w-none font-serif text-gray-800 whitespace-pre-wrap"
          >
            {content}
          </div>
        
          <div className="mt-12 pt-8 border-t flex flex-wrap items-center gap-4">
            <Button 
              variant={user_has_voted ? "secondary" : "outline"}
              className="flex items-center gap-2" 
              onClick={handleLike}
              disabled={likeLoading || !session}
              title={!session ? "You must be logged in to like poems" : ""}
            >
              <span ref={scope}>
                <Heart className={`h-5 w-5 text-pink-500 transition-colors ${user_has_voted ? 'fill-current' : ''}`} />
              </span>
              {likeLoading ? "..." : <>{user_has_voted ? 'Unlike' : 'Like'} ({votes})</>}
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
          {/* Comment Section */}
          <div className="mt-12 border-t pt-8">
            <h3 className="font-semibold text-xl mb-6">Comments</h3>
            <CommentSection poemId={poem.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PoemDetail;
