import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { ApplicantFilters } from "@/components/features/applicants/applicant-filters";
import { ApplicantPagination } from "@/components/features/applicants/applicant-pagination";
import { ApplicantTable } from "@/components/features/applicants/applicant-table";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApplicantsByCompanyId } from "@/features/applicants";
import type { ApplicantStatus } from "@/features/applicants/types";
import { getUserCompany } from "@/features/companies";
import { getJobsByCompanyId } from "@/features/jobs";
import { getCurrentUser } from "@/lib/auth";

const ITEMS_PER_PAGE = 20;

interface ApplicantsPageProps {
  searchParams: Promise<{
    page?: string;
    job?: string;
    status?: string;
    q?: string;
  }>;
}

export default async function ApplicantsPage({
  searchParams,
}: ApplicantsPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const company = await getUserCompany(user.id);
  if (!company) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const jobId = params.job;
  const status = params.status as ApplicantStatus | undefined;
  const search = params.q;

  const [{ applicants, total }, jobs] = await Promise.all([
    getApplicantsByCompanyId(company.id, {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      jobId,
      status,
      search,
    }),
    getJobsByCompanyId(company.id),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">応募者管理</h1>
            <p className="mt-1 text-muted-foreground">
              {company.name} の応募者一覧（{total}件）
            </p>
          </div>
          <Button asChild>
            <Link href="/applicants/new">
              <Plus className="mr-2 h-4 w-4" />
              新規登録
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <Suspense fallback={<Skeleton className="h-10 w-full max-w-2xl" />}>
            <ApplicantFilters
              jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
              currentJobId={jobId}
              currentStatus={status}
              currentSearch={search}
            />
          </Suspense>
        </div>

        {applicants.length === 0 ? (
          <EmptyState
            title="応募者がいません"
            description={
              jobId || status || search
                ? "条件に一致する応募者が見つかりませんでした。フィルターを変更してください。"
                : "新しい応募者を登録して、採用管理を始めましょう。"
            }
            action={
              !jobId && !status && !search ? (
                <Button asChild>
                  <Link href="/applicants/new">
                    <Plus className="mr-2 h-4 w-4" />
                    応募者を登録
                  </Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <ApplicantTable applicants={applicants} />

            {totalPages > 1 && (
              <div className="mt-6">
                <ApplicantPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
