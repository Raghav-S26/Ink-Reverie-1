
import { useParams, Link } from "react-router-dom";
import { poems } from "@/lib/mock-data";
import NotFound from "./NotFound";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";

const PoemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const poem = poems.find((p) => p.id === id);

  if (!poem) {
    return <NotFound />;
  }

  const { title, author, content, category, submissionDate, votes } = poem;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 p-8">
          <Badge variant="secondary" className="w-fit">{category}</Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mt-4">{title}</h1>
          <div className="flex items-center gap-4 mt-4">
            <Avatar>
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{author.name}</p>
              <p className="text-sm text-gray-500">Published on {new Date(submissionDate).toLocaleDateString()}</p>
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
            <Button variant="outline" className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" /> Like ({votes})
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-indigo" /> Comment
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-gray-500" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PoemDetail;
