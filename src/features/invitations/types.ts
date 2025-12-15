import type { CompanyRole } from "@/features/companies";

/**
 * 招待情報
 */
export type Invitation = {
  id: string;
  token: string;
  role: CompanyRole;
  expiresAt: Date;
  usedAt: Date | null;
  companyId: string;
  companyName: string;
};

/**
 * 招待の検証結果
 */
export type InvitationValidation =
  | {
      valid: true;
      company: { id: string; name: string };
      role: string;
      expiresAt: Date;
    }
  | {
      valid: false;
      reason: "not_found" | "expired" | "used" | "already_member";
      currentCompanyName?: string;
    };

/**
 * 招待作成の入力
 */
export type CreateInvitationInput = {
  companyId: string;
  role?: CompanyRole;
};

/**
 * Server Action の結果
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
