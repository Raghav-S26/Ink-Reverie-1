
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PoemSchema, PoemFormValues } from "@/lib/validators/poem";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const SubmitPoem = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const form = useForm<PoemFormValues>({
    resolver: zodResolver(PoemSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;

  // Redirect to login if not authenticated
  if (!session) {
    toast.info("Please log in to submit a poem.");
    navigate("/auth");
    return null;
  }

  async function onSubmit(values: PoemFormValues) {
    console.log("Attempting to submit poem with values:", values);
    if (!user) {
      toast.error("Authentication error. Please log in again.");
      console.error("SubmitPoem Error: User object is missing despite an active session.");
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase.from("poems").insert([
        {
          title: values.title,
          content: values.content,
          category: values.category || null,
          user_id: user.id,
          status: 'approved', // Auto-approval as defined in our RLS policies
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success("Your poem has been published successfully!");
      navigate("/poems");

    } catch (error: any) {
      toast.error("Failed to submit poem. " + error.message);
      console.error("Supabase insert error:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-8 my-12">
      <h1 className="text-3xl font-bold mb-6 font-serif text-center">Submit a Poem</h1>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poem Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your poem's title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="E.g. Nature, Love, Life" {...field} />
                </FormControl>
                <FormDescription>
                  Optional, but helps others discover your work.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poem Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your poem here..."
                    rows={10}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full bg-brand-indigo hover:bg-brand-indigo/90" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Poem"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SubmitPoem;
