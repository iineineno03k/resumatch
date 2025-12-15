/**
 * 会社情報
 */
export type Company = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | null;
};

/**
 * ユーザーの会社（役割付き）
 */
export type CompanyWithRole = Company & {
  role: CompanyRole;
  memberCount: number;
  jobCount: number;
};

/**
 * 会社での役割
 */
export type CompanyRole = "owner" | "admin" | "member";

/**
 * 会社作成の入力
 */
export type CreateCompanyInput = {
  name: string;
};

/**
 * Server Action の結果
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
