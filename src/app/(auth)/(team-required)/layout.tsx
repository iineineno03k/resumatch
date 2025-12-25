import { redirect } from "next/navigation";
import { getUserCompany } from "@/features/companies";
import { getCurrentUser } from "@/lib/auth";

// ビルド時の静的生成を無効化（認証・DB接続が必要なため）
export const dynamic = "force-dynamic";

export default async function CompanyRequiredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // 認証チェックは親の layout.tsx で行われるが、念のため
  if (!user) {
    redirect("/sign-in");
  }

  // 会社所属チェック
  const company = await getUserCompany(user.id);

  if (!company) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
