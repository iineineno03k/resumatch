"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { FilterSelect } from "@/components/common/filter-select";
import { SearchInput } from "@/components/common/search-input";
import type { ApplicantStatus } from "@/features/applicants/types";

interface Job {
  id: string;
  title: string;
}

interface ApplicantFiltersProps {
  jobs: Job[];
  currentJobId?: string;
  currentStatus?: ApplicantStatus;
  currentSearch?: string;
}

const statusOptions: { value: ApplicantStatus; label: string }[] = [
  { value: "screening", label: "書類選考" },
  { value: "first_interview", label: "一次面接" },
  { value: "second_interview", label: "二次面接" },
  { value: "final_interview", label: "最終面接" },
  { value: "offer", label: "内定" },
  { value: "accepted", label: "入社承諾" },
  { value: "rejected", label: "不採用" },
  { value: "withdrawn", label: "辞退" },
];

export function ApplicantFilters({
  jobs,
  currentJobId = "all",
  currentStatus = "all" as unknown as ApplicantStatus,
  currentSearch = "",
}: ApplicantFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      params.delete("page");

      startTransition(() => {
        router.push(`/applicants?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const handleJobChange = (value: string) => {
    updateSearchParams({ job: value });
  };

  const handleStatusChange = (value: string) => {
    updateSearchParams({ status: value });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParams({ q: value || undefined });
  };

  const jobOptions = jobs.map((job) => ({
    value: job.id,
    label: job.title,
  }));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        value={currentSearch}
        onChange={handleSearchChange}
        placeholder="名前で検索..."
        className="w-[240px]"
      />
      <FilterSelect
        value={currentJobId}
        onChange={handleJobChange}
        options={jobOptions}
        placeholder="求人を選択"
        allLabel="すべての求人"
        className={isPending ? "opacity-70" : ""}
      />
      <FilterSelect
        value={currentStatus as string}
        onChange={handleStatusChange}
        options={statusOptions}
        placeholder="ステータス"
        allLabel="すべてのステータス"
        className={isPending ? "opacity-70" : ""}
      />
    </div>
  );
}
