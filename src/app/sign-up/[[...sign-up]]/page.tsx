import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// サーバーサイドでモックモードを判定
const isAuthMockEnabled = process.env.USE_AUTH_MOCK === "true";

export default function SignUpPage() {
  // モックモードでは sign-in にリダイレクト
  if (isAuthMockEnabled) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
