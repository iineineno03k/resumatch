import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { MockSignIn } from "./mock-sign-in";

// サーバーサイドでモックモードを判定
const isAuthMockEnabled = process.env.USE_AUTH_MOCK === "true";

export default function SignInPage() {
  // モックモードでは自動的にダッシュボードへ
  if (isAuthMockEnabled) {
    return <MockSignIn />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
