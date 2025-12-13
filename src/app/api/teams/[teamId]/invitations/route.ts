import { created, handleApiError, requireTeamAdmin } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db/client";

/**
 * POST /api/teams/:teamId/invitations
 * 招待リンクを発行（admin以上のみ）
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const user = await requireAuth();
    const { teamId } = await params;
    const body = await request.json();

    // 管理者権限チェック
    await requireTeamAdmin(teamId, user.id);

    // ロールのバリデーション
    const role = body.role || "member";
    if (!["member", "admin"].includes(role)) {
      throw new Error("VALIDATION_ERROR: 無効なロールです");
    }

    // トークン生成（nanoid的なランダム文字列）
    const token = generateToken();

    // 有効期限（7日後）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 招待を作成
    const invitation = await prisma.team_invitations.create({
      data: {
        team_id: teamId,
        invited_by_user_id: user.id,
        token,
        role,
        expires_at: expiresAt,
      },
      include: {
        teams: {
          select: { name: true },
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return created({
      id: invitation.id,
      token: invitation.token,
      inviteUrl: `${baseUrl}/invite/${invitation.token}`,
      role: invitation.role,
      teamName: invitation.teams.name,
      expiresAt: invitation.expires_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * ランダムなトークンを生成（URL-safe）
 */
function generateToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (const byte of array) {
    token += chars[byte % chars.length];
  }
  return token;
}
