import type { AuthUser } from "./types";

/**
 * 開発用モックユーザー
 * USE_AUTH_MOCK=true のときに使用される
 */
export const MOCK_USERS = {
  /** デフォルトのモックユーザー */
  default: {
    clerkUserId: "user_mock_default",
    email: "dev@example.com",
    name: "開発ユーザー",
    avatarUrl: null,
  },
  /** オーナー権限のモックユーザー */
  owner: {
    clerkUserId: "user_mock_owner",
    email: "owner@example.com",
    name: "会社オーナー",
    avatarUrl: null,
  },
  /** メンバー権限のモックユーザー */
  member: {
    clerkUserId: "user_mock_member",
    email: "member@example.com",
    name: "会社メンバー",
    avatarUrl: null,
  },
} as const satisfies Record<string, AuthUser>;

export type MockUserKey = keyof typeof MOCK_USERS;

/**
 * モック認証が有効かどうか
 */
export function isAuthMockEnabled(): boolean {
  return process.env.USE_AUTH_MOCK === "true";
}

/**
 * 現在のモックユーザーを取得
 * MOCK_USER_KEY 環境変数で切り替え可能（default, owner, member）
 */
export function getMockUser(): AuthUser {
  const key = (process.env.MOCK_USER_KEY || "default") as MockUserKey;
  return MOCK_USERS[key] || MOCK_USERS.default;
}
