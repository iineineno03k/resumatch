import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db/client";
import { getMockUser, isAuthMockEnabled } from "./mock";
import type { AuthUser, CurrentUser } from "./types";

export { getMockUser, isAuthMockEnabled, MOCK_USERS } from "./mock";
export type { AuthUser, CurrentUser } from "./types";

/**
 * 認証済みユーザー情報を取得（Clerk から）
 * モックモードの場合はモックユーザーを返す
 *
 * @returns AuthUser | null - 未認証の場合は null
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  // モックモードの場合
  if (isAuthMockEnabled()) {
    return getMockUser();
  }

  // Clerk から取得
  const user = await currentUser();
  if (!user) {
    return null;
  }

  return {
    clerkUserId: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
    avatarUrl: user.imageUrl || null,
  };
}

/**
 * DB の users テーブルと紐づいた現在のユーザー情報を取得
 * ユーザーが DB に存在しない場合は自動作成する
 *
 * @returns CurrentUser | null - 未認証の場合は null
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const authUser = await getAuthUser();
  if (!authUser) {
    return null;
  }

  // DB からユーザーを取得、なければ作成
  let dbUser = await prisma.users.findUnique({
    where: { clerk_user_id: authUser.clerkUserId },
  });

  if (!dbUser) {
    // ユーザーが存在しない場合は作成（Webhook より先にアクセスした場合など）
    dbUser = await prisma.users.create({
      data: {
        clerk_user_id: authUser.clerkUserId,
        email: authUser.email,
        name: authUser.name,
        avatar_url: authUser.avatarUrl,
      },
    });
  }

  return {
    id: dbUser.id,
    clerkUserId: dbUser.clerk_user_id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.avatar_url,
  };
}

/**
 * 認証必須の API で使用
 * 未認証の場合は例外をスローする
 *
 * @throws Error 未認証の場合
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
