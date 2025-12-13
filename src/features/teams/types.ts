/**
 * チーム情報
 */
export type Team = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | null;
};

/**
 * ユーザーが所属するチーム（役割付き）
 */
export type TeamWithRole = Team & {
  role: TeamRole;
  memberCount: number;
  jobCount: number;
};

/**
 * チームの役割
 */
export type TeamRole = "owner" | "admin" | "member";

/**
 * チーム作成の入力
 */
export type CreateTeamInput = {
  name: string;
};

/**
 * Server Action の結果
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
