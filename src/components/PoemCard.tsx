
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { Poem } from "@/lib/mock-data";

interface PoemCardProps {
  poem: Poem;
}

const PoemCard = ({ poem }: PoemCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-xl">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">{poem.title}</CardTitle>
          <p className="text-sm text-gray-500">by {poem.author.name}</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-gray-700 italic font-serif leading-relaxed">{poem.excerpt}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Badge variant="secondary">{poem.category}</Badge>
          <div className="flex items-center gap-2 text-gray-500">
            <Heart className="h-4 w-4 text-pink-400" />
            <span>{poem.votes}</span>
          </div>
        </CardFooter>
        <Link to={`/poems/${poem.id}`} className="block bg-gray-50 text-center p-3 font-semibold text-brand-indigo hover:bg-gray-100 transition-colors">
            Read More
        </Link>
      </Card>
    </motion.div>
  );
};

export default PoemCard;
