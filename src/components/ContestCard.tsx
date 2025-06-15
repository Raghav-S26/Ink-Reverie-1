
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Contest } from "@/lib/types";
import { Calendar, Trophy } from "lucide-react";

interface ContestCardProps {
  contest: Contest;
}

const ContestCard = ({ contest }: ContestCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-xl bg-gradient-to-br from-indigo-50 via-white to-amber-50">
        <CardHeader>
          <CardTitle className="text-2xl text-brand-indigo">{contest.title}</CardTitle>
          <CardDescription>{contest.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {contest.end_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-brand-indigo"/>
                    <span>Deadline: {new Date(contest.end_date).toLocaleDateString()}</span>
                </div>
            )}
            {contest.prize && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4 text-brand-gold"/>
                    <span>Prize: {contest.prize}</span>
                </div>
            )}
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white">View & Enter</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ContestCard;
