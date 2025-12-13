"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db/client";
import type { ActionResult, Invitation } from "./types";

/**
 * 招待リンクを発行（admin以上のみ）
 */
export async function createInvitation(input: {
  teamId: string;
  role?: "member" | "admin";
}): Promise<ActionResult<Invitation>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { teamId, role = "member" } = input;

  // 権限チェック
  const membership = await prisma.team_members.findUnique({
    where: {
      team_id_user_id: {
        team_id: teamId,
        user_id: user.id,
      },
    },
  });

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "この操作には管理者権限が必要です" };
  }

  // ロールバリデーション
  if (!["member", "admin"].includes(role)) {
    return { success: false, error: "無効なロールです" };
  }

  // トークン生成
  const token = generateToken();

  // 有効期限（7日後）
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // 招待作成
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

  revalidatePath(`/teams/${teamId}/settings`);

  return {
    success: true,
    data: {
      id: invitation.id,
      token: invitation.token,
      role: invitation.role as Invitation["role"],
      expiresAt: invitation.expires_at,
      usedAt: invitation.used_at,
      teamId: invitation.team_id,
      teamName: invitation.teams.name,
    },
  };
}

/**
 * 招待を受け入れてチームに参加
 */
export async function acceptInvitation(
  token: string,
): Promise<ActionResult<{ teamId: string; teamName: string; role: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  // 招待を検索
  const invitation = await prisma.team_invitations.findUnique({
    where: { token },
    include: {
      teams: {
        select: { id: true, name: true },
      },
    },
  });

  if (!invitation) {
    return { success: false, error: "招待が見つかりません" };
  }

  if (invitation.used_at) {
    return { success: false, error: "この招待はすでに使用されています" };
  }

  if (new Date() > invitation.expires_at) {
    return { success: false, error: "この招待の有効期限が切れています" };
  }

  // すでにメンバーかチェック
  const existingMembership = await prisma.team_members.findUnique({
    where: {
      team_id_user_id: {
        team_id: invitation.team_id,
        user_id: user.id,
      },
    },
  });

  if (existingMembership) {
    return { success: false, error: "すでにこのチームのメンバーです" };
  }

  // トランザクションでメンバー追加と招待更新
  await prisma.$transaction([
    prisma.team_members.create({
      data: {
        team_id: invitation.team_id,
        user_id: user.id,
        role: invitation.role,
      },
    }),
    prisma.team_invitations.update({
      where: { id: invitation.id },
      data: { used_at: new Date() },
    }),
  ]);

  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      teamId: invitation.teams.id,
      teamName: invitation.teams.name,
      role: invitation.role,
    },
  };
}

/**
 * ランダムなトークンを生成
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
