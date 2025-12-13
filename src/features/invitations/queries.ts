import prisma from "@/lib/db/client";
import type { InvitationValidation } from "./types";

/**
 * 招待トークンを検証
 * 認証不要で呼び出し可能
 */
export async function validateInvitationToken(
  token: string,
): Promise<InvitationValidation> {
  const invitation = await prisma.team_invitations.findUnique({
    where: { token },
    include: {
      teams: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // 存在しない
  if (!invitation) {
    return { valid: false, reason: "not_found" };
  }

  // 使用済み
  if (invitation.used_at) {
    return { valid: false, reason: "used" };
  }

  // 期限切れ
  if (new Date() > invitation.expires_at) {
    return { valid: false, reason: "expired" };
  }

  // 有効
  return {
    valid: true,
    team: {
      id: invitation.teams.id,
      name: invitation.teams.name,
    },
    role: invitation.role,
    expiresAt: invitation.expires_at,
  };
}
