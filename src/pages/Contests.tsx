
import ContestCard from "@/components/ContestCard";
import { contests } from "@/lib/mock-data";

const Contests = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold font-serif">Active Contests</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {contests.map((contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  );
};

export default Contests;
