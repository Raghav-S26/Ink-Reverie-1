
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PoemCard from "@/components/PoemCard";
import SearchBar from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { PoemWithAuthor } from "@/lib/types";

const fetchPoems = async (searchQuery?: string): Promise<PoemWithAuthor[]> => {
  const { data, error } = await supabase.rpc('get_public_poems_with_authors');
  if (error) throw new Error(error.message);
  
  let poems = data || [];
  
  // Filter poems based on search query
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    poems = poems.filter((poem) => 
      poem.title.toLowerCase().includes(query) ||
      poem.content.toLowerCase().includes(query) ||
      (poem.author_name && poem.author_name.toLowerCase().includes(query)) ||
      (poem.category && poem.category.toLowerCase().includes(query))
    );
  }
  
  return poems;
};

const BrowsePoems = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize search query from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const { data: poems, isLoading, isError } = useQuery({
    queryKey: ["poems", searchQuery],
    queryFn: () => fetchPoems(searchQuery),
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Update URL params
    if (query.trim()) {
      setSearchParams({ search: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-serif">Explore All Poetry</h1>
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Search by poem title, content, poet name, or category..."
          className="max-w-2xl"
          initialValue={searchQuery}
        />
      </div>
      
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-red-500">Failed to load poems. Please try again later.</p>
      ) : poems && poems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'No poems found matching your search.' : 'No poems available.'}
          </p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Try searching with different keywords or browse all poems.
            </p>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {poems?.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      )}
      
      {poems && poems.length > 0 && searchQuery && (
        <div className="text-center text-sm text-muted-foreground">
          Found {poems.length} poem{poems.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default BrowsePoems;
