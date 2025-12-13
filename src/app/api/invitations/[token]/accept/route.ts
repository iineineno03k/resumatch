import { Errors, handleApiError, success } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db/client";

/**
 * POST /api/invitations/:token/accept
 * 招待を受け入れてチームに参加（認証必須）
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const user = await requireAuth();
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
      throw Errors.notFound("招待が見つかりません");
    }

    // 使用済み
    if (invitation.used_at) {
      throw Errors.validation("この招待はすでに使用されています");
    }

    // 期限切れ
    if (new Date() > invitation.expires_at) {
      throw Errors.validation("この招待の有効期限が切れています");
    }

    // すでにチームメンバーかチェック
    const existingMembership = await prisma.team_members.findUnique({
      where: {
        team_id_user_id: {
          team_id: invitation.team_id,
          user_id: user.id,
        },
      },
    });

    if (existingMembership) {
      throw Errors.validation("すでにこのチームのメンバーです");
    }

    // トランザクションでメンバー追加と招待更新
    await prisma.$transaction([
      // メンバー追加
      prisma.team_members.create({
        data: {
          team_id: invitation.team_id,
          user_id: user.id,
          role: invitation.role,
        },
      }),
      // 招待を使用済みに
      prisma.team_invitations.update({
        where: { id: invitation.id },
        data: { used_at: new Date() },
      }),
    ]);

    return success({
      teamId: invitation.teams.id,
      teamName: invitation.teams.name,
      role: invitation.role,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
