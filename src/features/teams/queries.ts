import prisma from "@/lib/db/client";
import type { TeamWithRole } from "./types";

/**
 * ユーザーが所属するチーム一覧を取得
 * Server Component から直接呼び出す
 */
export async function getTeamsByUserId(
  userId: string,
): Promise<TeamWithRole[]> {
  const memberships = await prisma.team_members.findMany({
    where: { user_id: userId },
    include: {
      teams: {
        include: {
          _count: {
            select: {
              team_members: true,
              jobs: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return memberships.map((m) => ({
    id: m.teams.id,
    name: m.teams.name,
    slug: m.teams.slug,
    role: m.role as TeamWithRole["role"],
    memberCount: m.teams._count.team_members,
    jobCount: m.teams._count.jobs,
    createdAt: m.teams.created_at,
  }));
}

/**
 * チームを取得（メンバーシップ確認付き）
 */
export async function getTeamWithMembership(
  teamId: string,
  userId: string,
): Promise<(TeamWithRole & { isMember: boolean }) | null> {
  const membership = await prisma.team_members.findUnique({
    where: {
      team_id_user_id: {
        team_id: teamId,
        user_id: userId,
      },
    },
    include: {
      teams: {
        include: {
          _count: {
            select: {
              team_members: true,
              jobs: true,
            },
          },
        },
      },
    },
  });

  if (!membership) {
    return null;
  }

  return {
    id: membership.teams.id,
    name: membership.teams.name,
    slug: membership.teams.slug,
    role: membership.role as TeamWithRole["role"],
    memberCount: membership.teams._count.team_members,
    jobCount: membership.teams._count.jobs,
    createdAt: membership.teams.created_at,
    isMember: true,
  };
}
