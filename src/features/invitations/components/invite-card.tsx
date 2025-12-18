"use client";

import { Building2, Calendar, UserPlus, XCircle } from "lucide-react";
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
import type { InvitationValidation } from "../types";

type Props = {
  /** 招待の検証結果 */
  validation: InvitationValidation;
  /** ユーザーがログイン済みかどうか */
  isLoggedIn: boolean;
  /** 招待トークン（ログインリダイレクト用） */
  token: string;
  /** 招待受け入れ処理 */
  onAccept: () => Promise<{ success: boolean; error?: string }>;
};

/**
 * 招待を受け入れる際のカード
 */
export function InviteCard({ validation, isLoggedIn, token, onAccept }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // 無効な招待の場合
  if (!validation.valid) {
    return (
      <InvalidInviteCard
        reason={validation.reason}
        currentCompanyName={validation.currentCompanyName}
      />
    );
  }

  const { company, role, expiresAt } = validation;
  const formattedDate = new Date(expiresAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const result = await onAccept();
      if (result.success) {
        router.push("/jobs");
      } else {
        setError(result.error ?? "参加に失敗しました");
      }
    });
  };

  const handleLoginRedirect = () => {
    // ログイン後に招待ページに戻るようにリダイレクト
    router.push(`/sign-in?redirect_url=/invite/${token}`);
  };

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="flex flex-col items-center text-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">会社に招待されています</CardTitle>
          <CardDescription className="text-balance">
            招待を受け入れて会社に参加しましょう
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 会社情報 */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">会社名</p>
              <p className="font-medium">{company.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">参加後の権限</p>
              <p className="font-medium">{getRoleDisplayName(role)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">有効期限</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {/* アクションボタン */}
        {isLoggedIn ? (
          <Button
            className="w-full"
            size="lg"
            onClick={handleAccept}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" />
                参加中...
              </>
            ) : (
              "招待を受け入れる"
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleLoginRedirect}>
              ログインして参加
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              アカウントをお持ちでない場合は、ログイン画面から新規登録できます
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 無効な招待の表示カード
 */
function InvalidInviteCard({
  reason,
  currentCompanyName,
}: {
  reason: "not_found" | "expired" | "used" | "already_member";
  currentCompanyName?: string;
}) {
  const router = useRouter();

  const getMessage = () => {
    switch (reason) {
      case "not_found":
        return {
          title: "招待が見つかりません",
          description:
            "この招待リンクは無効です。URLが正しいか確認してください。",
        };
      case "expired":
        return {
          title: "招待の有効期限が切れています",
          description:
            "この招待リンクの有効期限が切れています。招待した方に新しいリンクを発行してもらってください。",
        };
      case "used":
        return {
          title: "この招待は使用済みです",
          description:
            "この招待リンクはすでに使用されています。招待した方に新しいリンクを発行してもらってください。",
        };
      case "already_member":
        return {
          title: "すでに会社に所属しています",
          description: currentCompanyName
            ? `現在「${currentCompanyName}」に所属しています。別の会社に参加するには、現在の会社から退出する必要があります。`
            : "すでに別の会社に所属しているため、この招待を受け入れることはできません。",
        };
    }
  };

  const { title, description } = getMessage();

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="flex flex-col items-center text-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-balance">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/")}
        >
          トップページへ
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * ロールの表示名を取得
 */
function getRoleDisplayName(role: string): string {
  switch (role) {
    case "owner":
      return "オーナー";
    case "admin":
      return "管理者";
    case "member":
      return "メンバー";
    default:
      return role;
  }
}
