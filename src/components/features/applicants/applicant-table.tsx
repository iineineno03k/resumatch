import { FileText } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ApplicantListItem } from "@/features/applicants/types";
import { formatDate } from "@/lib/utils";

interface ApplicantTableProps {
  applicants: ApplicantListItem[];
}

export function ApplicantTable({ applicants }: ApplicantTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">氏名</TableHead>
            <TableHead className="w-[180px]">応募求人</TableHead>
            <TableHead className="w-[120px]">ステータス</TableHead>
            <TableHead className="w-[80px] text-center">履歴書</TableHead>
            <TableHead className="w-[120px]">応募日</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((applicant) => (
            <TableRow key={applicant.id}>
              <TableCell>
                <Link
                  href={`/applicants/${applicant.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {applicant.name}
                </Link>
                {applicant.aiSummary && (
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {applicant.aiSummary}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {applicant.jobTitle}
              </TableCell>
              <TableCell>
                <StatusBadge status={applicant.status} />
              </TableCell>
              <TableCell className="text-center">
                {applicant.hasResume ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FileText className="mx-auto h-4 w-4 text-green-600" />
                      </TooltipTrigger>
                      <TooltipContent>履歴書あり</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {applicant.appliedAt ? formatDate(applicant.appliedAt) : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
