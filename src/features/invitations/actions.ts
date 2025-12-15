"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db/client";
import type { ActionResult, Invitation } from "./types";

/**
 * 招待リンクを発行（admin以上のみ）
 */
export async function createInvitation(input: {
  companyId: string;
  role?: "member" | "admin";
}): Promise<ActionResult<Invitation>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { companyId, role = "member" } = input;

  // ユーザーがこの会社に所属しているか確認
  const dbUser = await prisma.users.findUnique({
    where: { id: user.id },
    select: { company_id: true, role: true },
  });

  if (!dbUser?.company_id || dbUser.company_id !== companyId) {
    return { success: false, error: "この会社へのアクセス権限がありません" };
  }

  if (!["owner", "admin"].includes(dbUser.role ?? "")) {
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
  const invitation = await prisma.company_invitations.create({
    data: {
      company_id: companyId,
      invited_by_user_id: user.id,
      token,
      role,
      expires_at: expiresAt,
    },
    include: {
      companies: {
        select: { name: true },
      },
    },
  });

  revalidatePath(`/settings`);

  return {
    success: true,
    data: {
      id: invitation.id,
      token: invitation.token,
      role: invitation.role as Invitation["role"],
      expiresAt: invitation.expires_at,
      usedAt: invitation.used_at,
      companyId: invitation.company_id,
      companyName: invitation.companies.name,
    },
  };
}

/**
 * 招待を受け入れて会社に参加
 * 1ユーザー = 1会社なので、すでに会社に所属している場合はエラー
 */
export async function acceptInvitation(
  token: string,
): Promise<
  ActionResult<{ companyId: string; companyName: string; role: string }>
> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  // すでに会社に所属しているかチェック
  const dbUser = await prisma.users.findUnique({
    where: { id: user.id },
    select: { company_id: true },
  });

  if (dbUser?.company_id) {
    return { success: false, error: "すでに会社に所属しています" };
  }

  // 招待を検索
  const invitation = await prisma.company_invitations.findUnique({
    where: { token },
    include: {
      companies: {
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

  // トランザクションでユーザー更新と招待更新
  await prisma.$transaction([
    prisma.users.update({
      where: { id: user.id },
      data: {
        company_id: invitation.company_id,
        role: invitation.role,
      },
    }),
    prisma.company_invitations.update({
      where: { id: invitation.id },
      data: { used_at: new Date() },
    }),
  ]);

  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      companyId: invitation.companies.id,
      companyName: invitation.companies.name,
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
