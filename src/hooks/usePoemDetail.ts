
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PoemDetailData } from "@/lib/types";

const fetchPoem = async (id: string): Promise<PoemDetailData | null> => {
  const { data, error } = await supabase
    .rpc('get_public_poem_details', { p_poem_id: id })
    .single();
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return data;
};

export const usePoemDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["poem", id],
    queryFn: () => fetchPoem(id!),
    enabled: !!id,
  });
};
