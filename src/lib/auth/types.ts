/**
 * アプリケーション内で使用する認証済みユーザーの型
 * Clerk の User 型から必要なフィールドのみ抽出
 */
export type AuthUser = {
  /** Clerk のユーザーID (user_xxx 形式) */
  clerkUserId: string;
  /** メールアドレス */
  email: string;
  /** 表示名 */
  name: string | null;
  /** アバター画像URL */
  avatarUrl: string | null;
};

/**
 * DB の users テーブルと紐づいたユーザー情報
 */
export type CurrentUser = AuthUser & {
  /** DB の users.id (UUID) */
  id: string;
};
