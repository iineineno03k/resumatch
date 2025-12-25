import { getUserCompany } from "@/features/companies";
import type { InvitationValidation } from "@/features/invitations";
import {
  acceptInvitation,
  InviteCard,
  validateInvitationToken,
} from "@/features/invitations";
import { getAuthUser, getCurrentUser } from "@/lib/auth";

// ビルド時の静的生成を無効化（DB接続が必要なため）
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

async function handleAcceptInvitation(
  token: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  const result = await acceptInvitation(token);
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error };
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  // 招待トークンの検証（認証不要）
  let validation: InvitationValidation = await validateInvitationToken(token);

  // 認証状態の確認（ログインしているか）
  const authUser = await getAuthUser();
  const isLoggedIn = authUser !== null;

  // ログイン済みの場合、すでに会社に所属しているかチェック
  if (isLoggedIn && validation.valid) {
    const user = await getCurrentUser();
    if (user) {
      const company = await getUserCompany(user.id);
      if (company) {
        // すでに会社に所属している場合は招待を受け入れられない
        validation = {
          valid: false,
          reason: "already_member",
          currentCompanyName: company.name,
        };
      }
    }
  }

  // Server Action を bind してトークンを渡す
  const boundAcceptInvitation = handleAcceptInvitation.bind(null, token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <InviteCard
        validation={validation}
        isLoggedIn={isLoggedIn}
        token={token}
        onAccept={boundAcceptInvitation}
      />
    </div>
  );
}
