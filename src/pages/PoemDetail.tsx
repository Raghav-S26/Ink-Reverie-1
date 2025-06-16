
import { useParams, useNavigate } from "react-router-dom";
import NotFound from "./NotFound";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CommentSection from "@/components/CommentSection";
import PoemDetailHeader from "@/components/PoemDetailHeader";
import PoemContent from "@/components/PoemContent";
import PoemActions from "@/components/PoemActions";
import { usePoemDetail } from "@/hooks/usePoemDetail";

const PoemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: poem, isLoading, isError, refetch } = usePoemDetail(id);

  const handleDelete = () => {
    navigate("/poems");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !poem) {
    return <NotFound />;
  }

  const { 
    title, 
    author_name, 
    author_avatar_url, 
    content, 
    category, 
    submitted_at, 
    votes, 
    user_has_voted,
    user_id
  } = poem;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="p-0">
          <PoemDetailHeader
            category={category}
            title={title}
            authorName={author_name}
            authorAvatarUrl={author_avatar_url}
            submittedAt={submitted_at}
            authorId={user_id}
          />
        </CardHeader>
        <CardContent className="p-8">
          <PoemContent content={content} />
          
          <PoemActions
            poemId={poem.id}
            userHasVoted={user_has_voted}
            votes={votes}
            onRefetch={refetch}
            onDelete={handleDelete}
          />

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
