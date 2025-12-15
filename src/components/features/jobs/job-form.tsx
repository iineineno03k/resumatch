"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Job, JobStatus } from "@/features/jobs";
import { createJob, updateJob } from "@/features/jobs";

type FormState = {
  error?: string;
  success?: boolean;
};

type JobFormProps = {
  companyId: string;
  job?: Job;
  mode: "create" | "edit";
};

export function JobForm({ companyId, job, mode }: JobFormProps) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const requirements = formData.get("requirements") as string;
      const status = formData.get("status") as JobStatus | undefined;

      if (mode === "create") {
        const result = await createJob({
          companyId,
          title,
          description: description || undefined,
          requirements: requirements || undefined,
        });

        if (!result.success) {
          return { error: result.error };
        }

        router.push("/jobs");
        return { success: true };
      }

      if (!job) {
        return { error: "求人情報が見つかりません" };
      }

      const result = await updateJob({
        companyId,
        jobId: job.id,
        title,
        description: description || undefined,
        requirements: requirements || undefined,
        status,
      });

      if (!result.success) {
        return { error: result.error };
      }

      router.push("/jobs");
      return { success: true };
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          求人タイトル <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="例: フロントエンドエンジニア"
          defaultValue={job?.title ?? ""}
          required
          maxLength={255}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          応募者が最初に目にするタイトルです。職種や役割がわかりやすい名前をつけてください。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">仕事内容</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="仕事内容の詳細を記載してください"
          defaultValue={job?.description ?? ""}
          rows={5}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          業務内容、チーム構成、プロジェクトの概要などを記載します。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">応募要件</Label>
        <Textarea
          id="requirements"
          name="requirements"
          placeholder="必須スキル、歓迎スキル、経験年数など"
          defaultValue={job?.requirements ?? ""}
          rows={5}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          必須条件と歓迎条件を分けて記載すると、応募者が判断しやすくなります。
        </p>
      </div>

      {mode === "edit" && (
        <div className="space-y-2">
          <Label htmlFor="status">ステータス</Label>
          <Select name="status" defaultValue={job?.status ?? "open"}>
            <SelectTrigger id="status" disabled={isPending}>
              <SelectValue placeholder="ステータスを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">募集中</SelectItem>
              <SelectItem value="closed">募集終了</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            募集終了にすると、新規応募を受け付けなくなります。
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending
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
          disabled={isPending}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
