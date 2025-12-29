import {
  createCompany,
  OnboardingForm,
  WaitingForInvite,
} from "@/features/companies";

// 静的生成を無効化（Clerk コンポーネントを使用するため）
export const dynamic = "force-dynamic";

/**
 * 新規登録が許可されているかどうか
 * デフォルトは無効（招待専用）
 */
function isSignUpAllowed(): boolean {
  return process.env.ALLOW_SIGN_UP === "true";
}

async function handleCreateCompany(
  name: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  const result = await createCompany({ name });
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error };
}

export default function OnboardingPage() {
  // 招待専用モードの場合は招待待ち画面を表示
  if (!isSignUpAllowed()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <WaitingForInvite />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <OnboardingForm onSubmit={handleCreateCompany} />
    </div>
  );
}
