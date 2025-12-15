import { redirect } from "next/navigation";
import { getUserCompany } from "@/features/companies";
import { getCurrentUser } from "@/lib/auth";

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
