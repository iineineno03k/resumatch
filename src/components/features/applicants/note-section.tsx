"use client";

import { useState, useTransition } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { StarRating } from "@/components/common/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createNote } from "@/features/applicants";
import type { Note } from "@/features/applicants/types";

interface NoteSectionProps {
  notes: Note[];
  applicantId: string;
  companyId: string;
}

export function NoteSection({
  notes,
  applicantId,
  companyId,
}: NoteSectionProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await createNote({
        companyId,
        applicantId,
        content: content.trim(),
        rating: rating > 0 ? rating : undefined,
      });
      if (result.success) {
        setContent("");
        setRating(0);
      } else {
        setError(result.error);
      }
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* メモ一覧 */}
      {notes.length === 0 ? (
        <EmptyState
          title="メモがありません"
          description="この応募者にはまだメモが追加されていません。"
        />
      ) : (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <div key={note.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(note.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {note.user.name || "不明"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    {note.rating && (
                      <StarRating value={note.rating} readonly size="sm" />
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {note.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* メモ追加フォーム */}
      <Separator />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="メモを追加..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          disabled={isPending}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">評価:</span>
            <StarRating value={rating} onChange={setRating} size="md" />
            {rating > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRating(0)}
                className="h-auto px-2 py-1 text-xs"
              >
                クリア
              </Button>
            )}
          </div>
          <Button type="submit" disabled={isPending || !content.trim()}>
            {isPending ? "送信中..." : "メモを追加"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  );
}
