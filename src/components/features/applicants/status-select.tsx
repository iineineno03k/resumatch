"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateApplicant } from "@/features/applicants";
import type { ApplicantStatus } from "@/features/applicants/types";

const STATUS_OPTIONS: { value: ApplicantStatus; label: string }[] = [
  { value: "screening", label: "書類選考" },
  { value: "first_interview", label: "一次面接" },
  { value: "second_interview", label: "二次面接" },
  { value: "final_interview", label: "最終面接" },
  { value: "offer", label: "内定" },
  { value: "accepted", label: "入社承諾" },
  { value: "rejected", label: "不採用" },
  { value: "withdrawn", label: "辞退" },
];

interface StatusSelectProps {
  applicantId: string;
  companyId: string;
  currentStatus: ApplicantStatus;
}

export function StatusSelect({
  applicantId,
  companyId,
  currentStatus,
}: StatusSelectProps) {
  const [status, setStatus] = useState<ApplicantStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: ApplicantStatus) => {
    setStatus(newStatus);
    startTransition(async () => {
      const result = await updateApplicant({
        companyId,
        applicantId,
        status: newStatus,
      });
      if (!result.success) {
        setStatus(currentStatus);
      }
    });
  };

  return (
    <Select
      value={status}
      onValueChange={(value) => handleStatusChange(value as ApplicantStatus)}
      disabled={isPending}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
