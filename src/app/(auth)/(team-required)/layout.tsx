import { redirect } from "next/navigation";
import { getTeamsByUserId } from "@/features/teams";
import { getCurrentUser } from "@/lib/auth";

export default async function TeamRequiredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // 認証チェックは親の layout.tsx で行われるが、念のため
  if (!user) {
    redirect("/sign-in");
  }

  // チーム所属チェック
  const teams = await getTeamsByUserId(user.id);

  if (teams.length === 0) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
