import { Header } from "@/components/layout/header";
import { getUserCompany } from "@/features/companies";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const company = user ? await getUserCompany(user.id) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">ダッシュボード</h1>
          {company && (
            <p className="mt-1 text-muted-foreground">{company.name}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="求人"
            value={company?.jobCount ?? 0}
            href="/jobs"
          />
          <DashboardCard
            title="メンバー"
            value={company?.memberCount ?? 0}
            href="/settings"
          />
        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  href,
}: {
  title: string;
  value: number;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </a>
  );
}
