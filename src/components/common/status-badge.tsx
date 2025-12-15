import { Badge } from "@/components/ui/badge";
import type { ApplicantStatus } from "@/features/applicants/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  ApplicantStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  screening: { label: "書類選考", variant: "outline" },
  first_interview: { label: "一次面接", variant: "default" },
  second_interview: { label: "二次面接", variant: "default" },
  final_interview: {
    label: "最終面接",
    variant: "default",
    className: "bg-purple-600 hover:bg-purple-600/90",
  },
  offer: {
    label: "内定",
    variant: "default",
    className: "bg-blue-600 hover:bg-blue-600/90",
  },
  accepted: {
    label: "入社承諾",
    variant: "default",
    className: "bg-green-600 hover:bg-green-600/90",
  },
  rejected: { label: "不採用", variant: "destructive" },
  withdrawn: { label: "辞退", variant: "secondary" },
};

interface StatusBadgeProps {
  status: ApplicantStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export type { ApplicantStatus };
