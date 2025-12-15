import { Briefcase, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JobStatus } from "@/features/jobs";
import { cn } from "@/lib/utils";

export interface JobCardProps {
  id: string;
  title: string;
  status: JobStatus;
  applicantCount: number;
  createdAt: Date | null;
  className?: string;
}

const statusConfig: Record<
  JobStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  open: { label: "募集中", variant: "default" },
  closed: { label: "募集終了", variant: "secondary" },
};

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function JobCard({
  id,
  title,
  status,
  applicantCount,
  createdAt,
  className,
}: JobCardProps) {
  const config = statusConfig[status];

  return (
    <Link href={`/jobs/${id}`}>
      <Card
        className={cn(
          "transition-shadow hover:shadow-md cursor-pointer",
          className,
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <CardTitle className="truncate text-base">{title}</CardTitle>
                <CardDescription className="text-xs">
                  {formatDate(createdAt)} 作成
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={config.variant}
              className={cn(
                status === "open" && "bg-green-600 hover:bg-green-600/90",
              )}
            >
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>応募者 {applicantCount} 名</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
