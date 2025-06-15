
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  }
}

const fetchComments = async (poemId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id, content, user_id, created_at,
      profile:profiles (
        full_name, username, avatar_url
      )
    `)
    .eq("poem_id", poemId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  // The type generation might be lagging, so we cast to any first.
  return (data as any) || [];
};

const CommentSection = ({ poemId }: { poemId: string }) => {
  const { session, user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch comments
  const { data, isLoading, error } = useQuery({
    queryKey: ["comments", poemId],
    queryFn: () => fetchComments(poemId),
    enabled: !!poemId,
  });

  // Post a new comment
  const postComment = async () => {
    setLoading(true);
    const { error } = await supabase.from("comments").insert([
      {
        poem_id: poemId,
        user_id: user?.id,
        content: comment,
      },
    ]);
    setLoading(false);
    if (error) throw error;
    setComment("");
    toast.success("Comment posted!");
    queryClient.invalidateQueries({ queryKey: ["comments", poemId] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!session) {
      toast.error("You need to log in to comment.");
      return;
    }
    try {
      await postComment();
    } catch (err: any) {
      toast.error("Failed to post comment: " + err.message);
    }
  };

  return (
    <div>
      <form className="mb-8" onSubmit={handleSubmit}>
        <label htmlFor="add-comment" className="sr-only">Add a comment</label>
        <div className="flex gap-2">
          <Input
            id="add-comment"
            placeholder={session ? "Share your thoughts..." : "Log in to comment"}
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={!session || loading}
            maxLength={500}
          />
          <Button type="submit" disabled={!session || loading || !comment.trim()}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      ) : error ? (
        <p className="text-destructive">Could not load comments.</p>
      ) : data && data.length > 0 ? (
        <ul className="space-y-6">
          {data.map((c) => (
            <li key={c.id} className="flex items-start gap-4">
              <Avatar>
                {/* avatar not implemented - fallback only */}
                <AvatarFallback>
                  {(c.profile?.full_name || c.profile?.username || "U")[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {c.profile?.full_name || c.profile?.username || "Unknown"}
                  <span className="ml-2 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="whitespace-pre-line">{c.content}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No comments yet.</p>
      )}
    </div>
  );
};

export default CommentSection;
