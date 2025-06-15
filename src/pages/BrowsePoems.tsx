
import PoemCard from "@/components/PoemCard";
import { poems } from "@/lib/mock-data";

const BrowsePoems = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold font-serif">Explore All Poetry</h1>
      {/* Add filter/sort controls here in the future */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {poems.map((poem) => (
          <PoemCard key={poem.id} poem={poem} />
        ))}
      </div>
    </div>
  );
};

export default BrowsePoems;
