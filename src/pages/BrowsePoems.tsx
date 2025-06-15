
import PoemCard from "@/components/PoemCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PoemWithAuthor } from "@/lib/types";

const fetchPoems = async (): Promise<PoemWithAuthor[]> => {
  const { data, error } = await supabase.rpc('get_public_poems_with_authors');
  if (error) throw new Error(error.message);
  return data || [];
};

const BrowsePoems = () => {
  const { data: poems, isLoading, isError } = useQuery({
    queryKey: ["poems"],
    queryFn: fetchPoems,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold font-serif">Explore All Poetry</h1>
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-500">Failed to load poems. Please try again later.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {poems?.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowsePoems;
