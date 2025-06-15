
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { PoemWithAuthor } from "@/lib/types";

interface PoemCardProps {
  poem: PoemWithAuthor;
}

const PoemCard = ({ poem }: PoemCardProps) => {
  const excerpt = poem.content.substring(0, 100) + (poem.content.length > 100 ? "..." : "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">{poem.title}</CardTitle>
          <p className="text-sm text-muted-foreground">by {poem.author_name || 'Anonymous'}</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-foreground/90 italic font-serif leading-relaxed">{excerpt}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          {poem.category && <Badge variant="secondary">{poem.category}</Badge>}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4 text-pink-400" />
            <span>{poem.votes}</span>
          </div>
        </CardFooter>
        <Link to={`/poems/${poem.id}`} className="block bg-secondary/90 text-center p-3 font-semibold text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            Read More
        </Link>
      </Card>
    </motion.div>
  );
};

export default PoemCard;
