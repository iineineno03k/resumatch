"use client";

import { Users } from "lucide-react";
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
  /** フォーム送信後のリダイレクト先（デフォルト: /dashboard） */
  redirectTo?: string;
  /** チーム作成処理（Server Action を渡す） */
  onSubmit: (name: string) => Promise<{ success: boolean; error?: string }>;
};

export function OnboardingForm({ redirectTo = "/dashboard", onSubmit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teamName.trim()) {
      setError("チーム名を入力してください");
      return;
    }

    startTransition(async () => {
      const result = await onSubmit(teamName);

      if (result.success) {
        router.push(redirectTo);
      } else {
        setError(result.error ?? "チームの作成に失敗しました");
      }
    });
  };

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="flex flex-col items-center text-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">チームを作成</CardTitle>
          <CardDescription className="text-balance">
            ResuMatchを始めるには、まずチームを作成してください。
            後からチーム名は変更できます。
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="team-name">チーム名</Label>
            <Input
              id="team-name"
              type="text"
              placeholder="株式会社サンプル"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isPending}
              aria-invalid={!!error}
              aria-describedby={error ? "team-name-error" : undefined}
            />
            {error && (
              <p id="team-name-error" className="text-sm text-destructive">
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
                作成中...
              </>
            ) : (
              "チームを作成"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
