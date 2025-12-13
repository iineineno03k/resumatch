import prisma from "@/lib/db/client";
import { Errors } from "./errors";

/**
 * チームメンバーシップの役割
 */
export type TeamRole = "owner" | "admin" | "member";

/**
 * チームメンバーシップ情報
 */
export type TeamMembership = {
  teamId: string;
  userId: string;
  role: TeamRole;
};

/**
 * ユーザーがチームに所属しているか確認
 *
 * @param teamId チームID
 * @param userId ユーザーID（DB の users.id）
 * @throws ApiError チームに所属していない場合
 */
export async function requireTeamMembership(
  teamId: string,
  userId: string,
): Promise<TeamMembership> {
  const membership = await prisma.team_members.findUnique({
    where: {
      team_id_user_id: {
        team_id: teamId,
        user_id: userId,
      },
    },
  });

  if (!membership) {
    throw Errors.forbidden("このチームへのアクセス権限がありません");
  }

  return {
    teamId: membership.team_id,
    userId: membership.user_id,
    role: membership.role as TeamRole,
  };
}

/**
 * ユーザーがチームの管理者以上か確認
 *
 * @param teamId チームID
 * @param userId ユーザーID
 * @throws ApiError 管理者でない場合
 */
export async function requireTeamAdmin(
  teamId: string,
  userId: string,
): Promise<TeamMembership> {
  const membership = await requireTeamMembership(teamId, userId);

  if (membership.role !== "owner" && membership.role !== "admin") {
    throw Errors.forbidden("この操作には管理者権限が必要です");
  }

  return membership;
}

/**
 * ユーザーがチームのオーナーか確認
 *
 * @param teamId チームID
 * @param userId ユーザーID
 * @throws ApiError オーナーでない場合
 */
export async function requireTeamOwner(
  teamId: string,
  userId: string,
): Promise<TeamMembership> {
  const membership = await requireTeamMembership(teamId, userId);

  if (membership.role !== "owner") {
    throw Errors.forbidden("この操作にはオーナー権限が必要です");
  }

  return membership;
}

/**
 * チームが存在するか確認
 *
 * @param teamId チームID
 * @throws ApiError チームが存在しない場合
 */
export async function requireTeamExists(teamId: string) {
  const team = await prisma.teams.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw Errors.notFound("チームが見つかりません");
  }

  return team;
}
