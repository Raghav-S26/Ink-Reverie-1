
import { z } from "zod";

export const PoemSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }).max(100, { message: "Title must be 100 characters or less." }),
  content: z.string().min(10, { message: "Poem must be at least 10 characters long." }).max(5000, { message: "Poem must be 5000 characters or less." }),
  category: z.string().max(50, { message: "Category must be 50 characters or less." }).optional(),
});

export type PoemFormValues = z.infer<typeof PoemSchema>;
