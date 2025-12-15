import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/features/jobs/job-form";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserCompany } from "@/features/companies";
import { getCurrentUser } from "@/lib/auth";

export default async function NewJobPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const company = await getUserCompany(user.id);
  if (!company) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
      />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              求人一覧に戻る
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>新規求人作成</CardTitle>
          </CardHeader>
          <CardContent>
            <JobForm companyId={company.id} mode="create" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
