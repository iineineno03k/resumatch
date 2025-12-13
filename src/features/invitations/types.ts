import type { TeamRole } from "@/features/teams";

/**
 * 招待情報
 */
export type Invitation = {
  id: string;
  token: string;
  role: TeamRole;
  expiresAt: Date;
  usedAt: Date | null;
  teamId: string;
  teamName: string;
};

/**
 * 招待の検証結果
 */
export type InvitationValidation =
  | {
      valid: true;
      team: { id: string; name: string };
      role: string;
      expiresAt: Date;
    }
  | {
      valid: false;
      reason: "not_found" | "expired" | "used";
    };

/**
 * 招待作成の入力
 */
export type CreateInvitationInput = {
  teamId: string;
  role?: TeamRole;
};

/**
 * Server Action の結果
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
