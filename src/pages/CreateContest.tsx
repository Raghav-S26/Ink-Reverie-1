
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const contestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  prize: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type ContestFormValues = z.infer<typeof contestSchema>;

const CreateContest = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<ContestFormValues>({
    resolver: zodResolver(contestSchema),
    defaultValues: {
      title: '',
      description: '',
      prize: '',
      start_date: '',
      end_date: '',
    },
  });

  const createContestMutation = useMutation({
    mutationFn: async (values: ContestFormValues) => {
      const { data, error } = await supabase.from('contests').insert([
        {
          title: values.title,
          description: values.description || null,
          prize: values.prize || null,
          start_date: values.start_date ? new Date(values.start_date).toISOString() : null,
          end_date: values.end_date ? new Date(values.end_date).toISOString() : null,
        },
      ]).select();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Contest created successfully!');
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['activeContests'] });
      navigate('/contests');
    },
    onError: (error) => {
      toast.error(`Failed to create contest: ${error.message}`);
    },
  });

  const onSubmit = (values: ContestFormValues) => {
    createContestMutation.mutate(values);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold font-serif mb-8">Create New Contest</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Summer Poetry Slam" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the contest theme, rules, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prize</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., $100 Amazon Gift Card" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={createContestMutation.isPending}>
            {createContestMutation.isPending ? 'Creating...' : 'Create Contest'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateContest;
