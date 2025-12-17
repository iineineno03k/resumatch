"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  createJob,
  type Job,
  type JobFormValues,
  type JobStatus,
  jobFormSchema,
  updateJob,
} from "@/features/jobs";

type JobFormProps = {
  companyId: string;
  job?: Job;
  mode: "create" | "edit";
};

export function JobForm({ companyId, job, mode }: JobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job?.title ?? "",
      description: job?.description ?? "",
      requirements: job?.requirements ?? "",
      status: job?.status ?? "open",
    },
  });

  const onSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const result = await createJob({
          companyId,
          title: data.title,
          description: data.description || undefined,
          requirements: data.requirements || undefined,
        });

        if (!result.success) {
          form.setError("root", { message: result.error });
          return;
        }
      } else {
        if (!job) {
          form.setError("root", { message: "求人情報が見つかりません" });
          return;
        }

        const result = await updateJob({
          companyId,
          jobId: job.id,
          title: data.title,
          description: data.description || undefined,
          requirements: data.requirements || undefined,
          status: data.status as JobStatus,
        });

        if (!result.success) {
          form.setError("root", { message: result.error });
          return;
        }
      }

      router.push("/jobs");
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                求人タイトル <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="例: フロントエンドエンジニア"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                応募者が最初に目にするタイトルです。職種や役割がわかりやすい名前をつけてください。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>仕事内容</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="仕事内容の詳細を記載してください"
                  rows={5}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                業務内容、チーム構成、プロジェクトの概要などを記載します。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>応募要件</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="必須スキル、歓迎スキル、経験年数など"
                  rows={5}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                必須条件と歓迎条件を分けて記載すると、応募者が判断しやすくなります。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "edit" && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ステータス</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">募集中</SelectItem>
                    <SelectItem value="closed">募集終了</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  募集終了にすると、新規応募を受け付けなくなります。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create"
                ? "作成中..."
                : "保存中..."
              : mode === "create"
                ? "求人を作成"
                : "変更を保存"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/jobs")}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </Form>
  );
}
