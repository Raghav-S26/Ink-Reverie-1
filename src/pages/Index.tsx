
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PoemCard from "@/components/PoemCard";
import ContestCard from "@/components/ContestCard";
import { poems, contests } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const featuredPoems = poems.slice(0, 3);
  const activeContests = contests.slice(0, 2);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section 
        className="text-center py-16 md:py-24"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold font-serif text-gray-800 tracking-tight">
          Where Words Find Their Stage.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-600">
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
          {featuredPoems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
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
          {activeContests.map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
