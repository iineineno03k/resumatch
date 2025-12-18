"use client";

import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  /** フォーム送信後のリダイレクト先（デフォルト: /jobs） */
  redirectTo?: string;
  /** 会社作成処理（Server Action を渡す） */
  onSubmit: (name: string) => Promise<{ success: boolean; error?: string }>;
};

export function OnboardingForm({ redirectTo = "/jobs", onSubmit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError("会社名を入力してください");
      return;
    }

    startTransition(async () => {
      const result = await onSubmit(companyName);

      if (result.success) {
        router.push(redirectTo);
      } else {
        setError(result.error ?? "会社の作成に失敗しました");
      }
    });
  };

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="flex flex-col items-center text-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">会社を登録</CardTitle>
          <CardDescription className="text-balance">
            ResuMatchを始めるには、まず会社情報を登録してください。
            後から会社名は変更できます。
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="company-name">会社名</Label>
            <Input
              id="company-name"
              type="text"
              placeholder="株式会社サンプル"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isPending}
              aria-invalid={!!error}
              aria-describedby={error ? "company-name-error" : undefined}
            />
            {error && (
              <p id="company-name-error" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" />
                登録中...
              </>
            ) : (
              "会社を登録"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
