import { z } from "zod";

export const jobFormSchema = z.object({
  title: z
    .string()
    .min(1, "求人タイトルは必須です")
    .max(255, "求人タイトルは255文字以内で入力してください"),
  description: z.string().optional(),
  requirements: z.string().optional(),
  status: z.enum(["open", "closed"]).optional(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;
