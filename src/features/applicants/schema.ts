import { z } from "zod";

export const applicantFormSchema = z.object({
  name: z
    .string()
    .min(1, "氏名は必須です")
    .max(255, "氏名は255文字以内で入力してください"),
  email: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  jobId: z.string().min(1, "応募求人を選択してください"),
});

export type ApplicantFormValues = z.infer<typeof applicantFormSchema>;
