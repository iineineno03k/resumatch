import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">ResuMatch</h1>
      <p className="mt-4 text-lg text-gray-600">採用管理SaaS + AI履歴書解析</p>

      <div className="mt-8 flex gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ログイン
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              新規登録
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <Link
            href="/dashboard"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ダッシュボードへ
          </Link>
        </SignedIn>
      </div>
    </main>
  );
}
