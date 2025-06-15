import { useParams, Link } from "react-router-dom";
import NotFound from "./NotFound";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PoemDetailData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import CommentSection from "@/components/CommentSection";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

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
  const { session } = useAuth();

  const { data: poem, isLoading, isError, refetch } = useQuery({
    queryKey: ["poem", id],
    queryFn: () => fetchPoem(id!),
    enabled: !!id,
  });

  const [likeLoading, setLikeLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // Handle liking a poem
  const handleLike = async () => {
    if (!session) {
      toast.error("You need to be logged in to like poems.");
      return;
    }
    setLikeLoading(true);
    const { error } = await supabase
      .from("poems")
      .update({ votes: (poem?.votes ?? 0) + 1 })
      .eq("id", id!);
    setLikeLoading(false);
    if (error) {
      toast.error("Failed to like poem: " + error.message);
    } else {
      toast.success("Liked! ❤️");
      refetch();
    }
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

  const { title, author_name, author_avatar_url, content, category, submitted_at, votes } = poem;

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
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handleLike}
              disabled={likeLoading}
            >
              <Heart className="h-5 w-5 text-pink-500" /> 
              {likeLoading ? "Liking..." : <>Like ({votes})</>}
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
