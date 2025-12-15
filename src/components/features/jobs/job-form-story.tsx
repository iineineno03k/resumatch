"use client";

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
import type { Job } from "@/features/jobs";

type JobFormStoryProps = {
  job?: Job;
  mode: "create" | "edit";
  error?: string;
  isPending?: boolean;
};

/**
 * Storybook 用のモックコンポーネント
 * Server Action を使用しないプレゼンテーショナルバージョン
 */
export function JobFormStory({
  job,
  mode,
  error,
  isPending = false,
}: JobFormStoryProps) {
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
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
        <Button type="button" variant="outline" disabled={isPending}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
