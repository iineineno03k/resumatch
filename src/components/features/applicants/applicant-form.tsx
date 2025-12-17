"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FileUpload } from "@/components/common/file-upload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ApplicantFormValues,
  applicantFormSchema,
  createApplicant,
} from "@/features/applicants";
import { uploadResume } from "@/features/resumes";

type Job = {
  id: string;
  title: string;
};

type ApplicantFormProps = {
  companyId: string;
  jobs: Job[];
};

export function ApplicantForm({ companyId, jobs }: ApplicantFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ApplicantFormValues>({
    resolver: zodResolver(applicantFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      jobId: "",
    },
  });

  const onSubmit = async (data: ApplicantFormValues) => {
    setIsSubmitting(true);

    try {
      // 応募者を作成
      const applicantResult = await createApplicant({
        companyId,
        jobId: data.jobId,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
      });

      if (!applicantResult.success) {
        form.setError("root", { message: applicantResult.error });
        return;
      }

      const applicantId = applicantResult.data.id;

      // 履歴書がある場合はアップロード
      if (selectedFile) {
        const resumeResult = await uploadResume({
          companyId,
          applicantId,
          file: selectedFile,
        });

        if (!resumeResult.success) {
          // 応募者は作成済みなので、エラーを表示しつつリダイレクト
          router.push(
            `/applicants/${applicantId}?uploadError=${encodeURIComponent(resumeResult.error)}`,
          );
          return;
        }
      }

      router.push("/applicants");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                氏名 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="例: 山田 太郎"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="例: taro.yamada@example.com"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>電話番号</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="例: 090-1234-5678"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                応募求人 <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="求人を選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {jobs.length === 0 && (
                <FormDescription>
                  求人が登録されていません。先に求人を作成してください。
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>履歴書（PDF）</FormLabel>
          <FileUpload
            accept=".pdf"
            maxSize={10 * 1024 * 1024}
            onFileSelect={setSelectedFile}
            disabled={isSubmitting}
          />
          <p className="text-muted-foreground text-sm">
            履歴書はあとからアップロードすることもできます。
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || jobs.length === 0}>
            {isSubmitting ? "登録中..." : "応募者を登録"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/applicants")}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </Form>
  );
}
