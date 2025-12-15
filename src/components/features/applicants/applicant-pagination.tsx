"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Pagination } from "@/components/common/pagination";

interface ApplicantPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ApplicantPagination({
  currentPage,
  totalPages,
}: ApplicantPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }

      startTransition(() => {
        router.push(`/applicants?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
