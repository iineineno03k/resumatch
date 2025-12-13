import { handleApiError, success } from "@/lib/api";
import prisma from "@/lib/db/client";

type InvalidReason = "not_found" | "expired" | "used";

type ValidResponse = {
  valid: true;
  team: {
    id: string;
    name: string;
  };
  role: string;
  expiresAt: Date;
};

type InvalidResponse = {
  valid: false;
  reason: InvalidReason;
};

/**
 * GET /api/invitations/:token
 * 招待リンクを検証（認証不要）
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    // 招待を検索
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
      return success<InvalidResponse>({
        valid: false,
        reason: "not_found",
      });
    }

    // 使用済み
    if (invitation.used_at) {
      return success<InvalidResponse>({
        valid: false,
        reason: "used",
      });
    }

    // 期限切れ
    if (new Date() > invitation.expires_at) {
      return success<InvalidResponse>({
        valid: false,
        reason: "expired",
      });
    }

    // 有効
    return success<ValidResponse>({
      valid: true,
      team: {
        id: invitation.teams.id,
        name: invitation.teams.name,
      },
      role: invitation.role,
      expiresAt: invitation.expires_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
