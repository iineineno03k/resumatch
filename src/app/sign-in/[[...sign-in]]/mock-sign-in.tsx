"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * モック用サインインページ
 * 開発環境でClerkなしでログインをシミュレート
 */
export function MockSignIn() {
  const router = useRouter();

  const handleSignIn = () => {
    // モックモードではセッション不要、単にリダイレクト
    router.push("/jobs");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-2xl">ResuMatch</CardTitle>
          <CardDescription>開発モード - モック認証</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">モックユーザー情報</p>
            <p className="mt-1 text-muted-foreground">
              開発ユーザー (dev@example.com)
            </p>
          </div>
          <Button onClick={handleSignIn} className="w-full">
            ログイン（モック）
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            USE_AUTH_MOCK=true で動作中
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
