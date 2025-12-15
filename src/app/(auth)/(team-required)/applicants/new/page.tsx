import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicantForm } from "@/components/features/applicants/applicant-form";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserCompany } from "@/features/companies";
import { getJobsByCompanyId } from "@/features/jobs";
import { getCurrentUser } from "@/lib/auth";

export default async function NewApplicantPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const company = await getUserCompany(user.id);
  if (!company) {
    redirect("/onboarding");
  }

  const jobs = await getJobsByCompanyId(company.id, { status: "open" });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/applicants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              応募者一覧に戻る
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>応募者を登録</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicantForm
              companyId={company.id}
              jobs={jobs.map((job) => ({ id: job.id, title: job.title }))}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
