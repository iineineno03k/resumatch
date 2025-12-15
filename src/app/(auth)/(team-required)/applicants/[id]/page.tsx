import { ArrowLeft, Download, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AIAnalysisCard } from "@/components/features/applicants/ai-analysis-card";
import { NoteSection } from "@/components/features/applicants/note-section";
import { StatusSelect } from "@/components/features/applicants/status-select";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getApplicantById } from "@/features/applicants";
import { getUserCompany } from "@/features/companies";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ApplicantDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const company = await getUserCompany(user.id);
  if (!company) {
    redirect("/onboarding");
  }

  const applicant = await getApplicantById(company.id, id);
  if (!applicant) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/applicants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              応募者一覧に戻る
            </Link>
          </Button>
        </div>

        {/* ヘッダーカード */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{applicant.name}</h1>
                <p className="text-muted-foreground">{applicant.job.title}</p>
              </div>
              <StatusSelect
                applicantId={applicant.id}
                companyId={company.id}
                currentStatus={applicant.status}
              />
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {applicant.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a
                    href={`mailto:${applicant.email}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {applicant.email}
                  </a>
                </div>
              )}
              {applicant.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`tel:${applicant.phone}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {applicant.phone}
                  </a>
                </div>
              )}
              <div className="text-muted-foreground">
                応募日: {formatDate(applicant.appliedAt)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI解析結果 */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">AI解析結果</CardTitle>
            <div className="flex gap-2">
              {applicant.resume && (
                <form
                  action={`/api/resumes/${applicant.resume.id}/download`}
                  method="GET"
                >
                  <Button variant="outline" size="sm" type="submit">
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </form>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AIAnalysisCard
              resume={applicant.resume}
              companyId={company.id}
              applicantId={applicant.id}
            />
          </CardContent>
        </Card>

        {/* メモ・評価 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">メモ・評価</CardTitle>
          </CardHeader>
          <CardContent>
            <NoteSection
              notes={applicant.notes}
              applicantId={applicant.id}
              companyId={company.id}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
