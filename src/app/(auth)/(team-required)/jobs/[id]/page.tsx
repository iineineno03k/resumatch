import { ArrowLeft, Edit, Users } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserCompany } from "@/features/companies";
import type { JobStatus } from "@/features/jobs";
import { getJobById } from "@/features/jobs";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

const statusConfig: Record<
  JobStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  open: { label: "募集中", variant: "default" },
  closed: { label: "募集終了", variant: "secondary" },
};

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const company = await getUserCompany(user.id);
  if (!company) {
    redirect("/onboarding");
  }

  const job = await getJobById(company.id, id);
  if (!job) {
    notFound();
  }

  const config = statusConfig[job.status];

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              求人一覧に戻る
            </Link>
          </Button>
        </div>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <Badge
                variant={config.variant}
                className={cn(
                  job.status === "open" && "bg-green-600 hover:bg-green-600/90",
                )}
              >
                {config.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              作成日: {formatDate(job.createdAt)}
              {job.updatedAt && ` / 更新日: ${formatDate(job.updatedAt)}`}
            </p>
          </div>
          <Button asChild>
            <Link href={`/jobs/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">応募状況</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-semibold">
                  {job.applicantCount}
                </span>
                <span className="text-muted-foreground">名の応募者</span>
              </div>
            </CardContent>
          </Card>

          {job.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">仕事内容</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{job.description}</p>
              </CardContent>
            </Card>
          )}

          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">応募要件</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {job.requirements}
                </p>
              </CardContent>
            </Card>
          )}

          {!job.description && !job.requirements && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p>仕事内容と応募要件がまだ設定されていません。</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href={`/jobs/${id}/edit`}>編集して追加する</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
