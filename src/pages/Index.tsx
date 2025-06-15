import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PoemCard from "@/components/PoemCard";
import ContestCard from "@/components/ContestCard";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PoemWithAuthor, Contest } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const fetchFeaturedPoems = async (): Promise<PoemWithAuthor[]> => {
  const { data, error } = await supabase.rpc('get_public_poems_with_authors').limit(3);
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchActiveContests = async (): Promise<Contest[]> => {
    const { data, error } = await supabase.from('contests').select('*').order('end_date').limit(2);
    if (error) throw new Error(error.message);
    return data || [];
}

const Index = () => {
  const { data: featuredPoems, isLoading: poemsLoading } = useQuery({
    queryKey: ["featuredPoems"],
    queryFn: fetchFeaturedPoems,
  });

  const { data: activeContests, isLoading: contestsLoading } = useQuery({
      queryKey: ['activeContests'],
      queryFn: fetchActiveContests
  });

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section 
        className="text-center py-16 md:py-24"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold font-serif text-foreground tracking-tight">
          Where Words Find Their Stage.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
          Join a vibrant community of poets. Share your voice, enter contests, and discover your next inspiration.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg" className="bg-brand-indigo hover:bg-brand-indigo/90">
            <Link to="/poems">Explore Poetry</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contests">View Contests</Link>
          </Button>
        </div>
      </motion.section>

      {/* Featured Poems */}
      <section>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-serif">Featured Poems</h2>
            <Link to="/poems" className="flex items-center gap-1 text-brand-indigo hover:underline">
                View All <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {poemsLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
          ) : (
            featuredPoems?.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))
          )}
        </div>
      </section>

      {/* Active Contests */}
      <section>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-serif">Active Contests</h2>
            <Link to="/contests" className="flex items-center gap-1 text-brand-indigo hover:underline">
                View All <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {contestsLoading ? (
            [...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
          ) : (
            activeContests?.map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
