"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function WaitingForInvite() {
  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="flex flex-col items-center text-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">招待が必要です</CardTitle>
          <CardDescription className="text-balance">
            ResuMatchを利用するには、既存の会社からの招待が必要です。
            管理者から招待リンクを受け取ってください。
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          招待リンクをお持ちの場合は、そのリンクから直接アクセスしてください。
        </p>
        <SignOutButton>
          <Button variant="outline" className="w-full" size="lg">
            ログアウト
          </Button>
        </SignOutButton>
      </CardContent>
    </Card>
  );
}
