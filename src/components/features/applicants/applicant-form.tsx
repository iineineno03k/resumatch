"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { FileUpload } from "@/components/common/file-upload";
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
import { createApplicant } from "@/features/applicants";
import { uploadResume } from "@/features/resumes";

type FormState = {
  error?: string;
  success?: boolean;
};

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;

      if (!selectedJobId) {
        return { error: "応募求人を選択してください" };
      }

      // 応募者を作成
      const applicantResult = await createApplicant({
        companyId,
        jobId: selectedJobId,
        name,
        email: email || undefined,
        phone: phone || undefined,
      });

      if (!applicantResult.success) {
        return { error: applicantResult.error };
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
          return { success: true };
        }
      }

      router.push("/applicants");
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
        <Label htmlFor="name">
          氏名 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="例: 山田 太郎"
          required
          maxLength={255}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="例: taro.yamada@example.com"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">電話番号</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="例: 090-1234-5678"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="job">
          応募求人 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedJobId}
          onValueChange={setSelectedJobId}
          disabled={isPending}
        >
          <SelectTrigger id="job">
            <SelectValue placeholder="求人を選択" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {jobs.length === 0 && (
          <p className="text-xs text-muted-foreground">
            求人が登録されていません。先に求人を作成してください。
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>履歴書（PDF）</Label>
        <FileUpload
          accept=".pdf"
          maxSize={10 * 1024 * 1024}
          onFileSelect={setSelectedFile}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          履歴書はあとからアップロードすることもできます。
        </p>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending || jobs.length === 0}>
          {isPending ? "登録中..." : "応募者を登録"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/applicants")}
          disabled={isPending}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
