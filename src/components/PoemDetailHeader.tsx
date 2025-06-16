
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/FollowButton";

interface PoemDetailHeaderProps {
  category: string | null;
  title: string;
  authorName: string | null;
  authorAvatarUrl: string | null;
  submittedAt: string | null;
  authorId: string;
}

const PoemDetailHeader = ({
  category,
  title,
  authorName,
  authorAvatarUrl,
  submittedAt,
  authorId,
}: PoemDetailHeaderProps) => {
  return (
    <div className="bg-gray-50 p-8">
      {category && <Badge variant="secondary" className="w-fit">{category}</Badge>}
      <h1 className="font-serif text-4xl md:text-5xl font-bold mt-4">{title}</h1>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={authorAvatarUrl || undefined} alt={authorName || 'Anonymous'} />
            <AvatarFallback>{authorName?.charAt(0) || 'A'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{authorName || 'Anonymous'}</p>
            {submittedAt && (
              <p className="text-sm text-gray-500">
                Published on {new Date(submittedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <FollowButton authorId={authorId} authorName={authorName || 'Anonymous'} />
      </div>
    </div>
  );
};

export default PoemDetailHeader;
