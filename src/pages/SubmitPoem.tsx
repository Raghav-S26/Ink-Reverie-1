
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SubmitPoem = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if not authenticated
  if (!session) {
    navigate("/auth");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setSubmitting(true);

    // Always set status to 'submitted'. Frontend cannot set 'approved'
    const { error } = await supabase.from("poems").insert([
      {
        title,
        content,
        category: category || null,
        user_id: user?.id,
        // status: 'submitted' is default per DB, do not set 'approved' here
      },
    ]);
    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit poem: " + error.message);
    } else {
      toast.success("Your poem has been submitted and is pending review.");
      navigate("/poems");
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 my-12">
      <h1 className="text-3xl font-bold mb-6 font-serif text-center">Submit a Poem</h1>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" className="font-medium block mb-1">Poem Title</label>
          <Input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter your poem's title"
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="font-medium block mb-1">Category <span className="text-sm text-gray-400">(Optional)</span></label>
          <Input
            id="category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="E.g. Nature, Love, Life"
          />
        </div>
        <div>
          <label htmlFor="content" className="font-medium block mb-1">Poem Text</label>
          <Textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your poem here..."
            minLength={10}
            required
            rows={8}
          />
        </div>
        <Button type="submit" className="w-full bg-brand-indigo hover:bg-brand-indigo/90" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Poem"}
        </Button>
      </form>
    </div>
  );
};

export default SubmitPoem;

