
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
import { useEffect } from "react";

const SubmitPoem = () => {
  const { user, session, profile } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session) {
      toast.info("Please log in to submit a poem.");
      navigate("/auth");
    }
  }, [session, navigate]);

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

  async function onSubmit(values: PoemFormValues) {
    console.log("Poem submission initiated. Form values:", values);

    if (!user) {
      toast.error("Authentication error", {
        description: "You must be logged in to submit a poem.",
      });
      console.error("SubmitPoem Error: User object is missing despite an active session.");
      navigate("/auth");
      return;
    }

    // Rely on the database to set the default status
    const poemData = {
      title: values.title,
      content: values.content,
      category: values.category || null,
      user_id: user.id,
    };
    
    console.log(`Submitting poem for user ID: ${user.id}. Payload:`, poemData);

    try {
      const { data, error } = await supabase
        .from("poems")
        .insert(poemData)
        .select();

      if (error) {
        console.error("Supabase insert error object:", error);
        if (error.message.includes("violates row-level security policy")) {
          throw new Error("You do not have permission to publish this poem. Please try logging in again.");
        }
        throw new Error(error.message);
      }

      console.log("Poem successfully inserted into Supabase:", data);
      toast.success("Your poem has been published successfully!");
      navigate("/poems");

    } catch (error: any) {
      toast.error("Failed to submit poem", {
        description: error.message,
      });
      console.error("Full error during poem submission:", error);
    }
  }
  
  if (!session) {
    // Render nothing while redirecting
    return null;
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

