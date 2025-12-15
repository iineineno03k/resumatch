"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = () => {
    const result: (
      | { type: "page"; value: number }
      | { type: "ellipsis"; key: string }
    )[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      for (let i = 1; i <= totalPages; i++) {
        result.push({ type: "page", value: i });
      }
    } else {
      result.push({ type: "page", value: 1 });

      if (currentPage > 3) {
        result.push({ type: "ellipsis", key: "ellipsis-start" });
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        result.push({ type: "page", value: i });
      }

      if (currentPage < totalPages - 2) {
        result.push({ type: "ellipsis", key: "ellipsis-end" });
      }

      result.push({ type: "page", value: totalPages });
    }

    return result;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="ページネーション"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="前のページ"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((item) =>
        item.type === "ellipsis" ? (
          <span
            key={item.key}
            className="flex h-10 w-10 items-center justify-center"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </span>
        ) : (
          <Button
            key={item.value}
            variant={item.value === currentPage ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(item.value)}
            aria-label={`ページ ${item.value}`}
            aria-current={item.value === currentPage ? "page" : undefined}
          >
            {item.value}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="次のページ"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
