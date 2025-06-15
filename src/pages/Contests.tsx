
import ContestCard from "@/components/ContestCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Contest } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const fetchContests = async (): Promise<Contest[]> => {
    const { data, error } = await supabase.from('contests').select('*').order('end_date');
    if (error) throw new Error(error.message);
    return data || [];
}

const Contests = () => {
    const { data: contests, isLoading, isError } = useQuery({
        queryKey: ['contests'],
        queryFn: fetchContests
    });

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold font-serif">Active Contests</h1>
      {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
      ) : isError ? (
          <p className="text-red-500">Failed to load contests. Please try again later.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
            {contests?.map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
            ))}
        </div>
      )}
    </div>
  );
};

export default Contests;
