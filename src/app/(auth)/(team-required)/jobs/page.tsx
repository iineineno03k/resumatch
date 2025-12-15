import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/common/empty-state";
import { JobCard } from "@/components/common/job-card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { getUserCompany } from "@/features/companies";
import { getJobsByCompanyId } from "@/features/jobs";
import { getCurrentUser } from "@/lib/auth";

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const company = await getUserCompany(user.id);
  if (!company) {
    redirect("/onboarding");
  }

  const jobs = await getJobsByCompanyId(company.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">求人管理</h1>
            <p className="mt-1 text-muted-foreground">
              {company.name} の求人一覧
            </p>
          </div>
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="求人がありません"
            description="新しい求人を作成して、応募者の募集を始めましょう。"
            action={
              <Button asChild>
                <Link href="/jobs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  求人を作成
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                status={job.status}
                applicantCount={job.applicantCount}
                createdAt={job.createdAt}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
