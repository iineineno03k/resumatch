import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * モック認証が有効かどうか
 * middleware では Node.js の process.env を直接参照
 */
function isAuthMockEnabled(): boolean {
  return process.env.USE_AUTH_MOCK === "true";
}

/**
 * モックモード時のミドルウェア（認証をスキップ）
 */
function mockMiddleware(_request: NextRequest) {
  return NextResponse.next();
}

/**
 * Clerk ミドルウェア（本番用）
 */
const clerkMw = clerkMiddleware();

/**
 * 新規登録が無効かどうか（招待専用モード）
 * デフォルトは無効（招待専用）
 */
function isSignUpDisabled(): boolean {
  return process.env.ALLOW_SIGN_UP !== "true";
}

export default function middleware(request: NextRequest) {
  // 新規登録ページへのアクセスをブロック（招待専用モード）
  if (isSignUpDisabled() && request.nextUrl.pathname.startsWith("/sign-up")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // モックモードの場合は認証をスキップ
  if (isAuthMockEnabled()) {
    return mockMiddleware(request);
  }
  // 本番モードは Clerk を使用
  return clerkMw(request, {} as never);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
