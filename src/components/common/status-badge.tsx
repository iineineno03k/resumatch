import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ApplicantStatus =
  | "new"
  | "screening"
  | "interview"
  | "offered"
  | "rejected"
  | "hired";

const statusConfig: Record<
  ApplicantStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  new: { label: "新規", variant: "secondary" },
  screening: { label: "書類選考", variant: "outline" },
  interview: { label: "面接", variant: "default" },
  offered: { label: "内定", variant: "default" },
  rejected: { label: "不採用", variant: "destructive" },
  hired: { label: "採用", variant: "default" },
};

interface StatusBadgeProps {
  status: ApplicantStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        status === "hired" && "bg-green-600 hover:bg-green-600/90",
        status === "offered" && "bg-blue-600 hover:bg-blue-600/90",
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
