import { cache } from "react";
import prisma from "@/lib/db/client";
import type { CompanyWithRole } from "./types";

/**
 * ユーザーの所属会社を取得
 * 1ユーザー = 1会社の設計
 * cache() でリクエスト内の重複呼び出しを除去
 */
export const getUserCompany = cache(async (
  userId: string,
): Promise<CompanyWithRole | null> => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      companies: {
        include: {
          _count: {
            select: {
              users: true,
              jobs: true,
            },
          },
        },
      },
    },
  });

  if (!user?.companies) {
    return null;
  }

  return {
    id: user.companies.id,
    name: user.companies.name,
    slug: user.companies.slug,
    role: (user.role ?? "member") as CompanyWithRole["role"],
    memberCount: user.companies._count.users,
    jobCount: user.companies._count.jobs,
    createdAt: user.companies.created_at,
  };
});

/**
 * 会社を取得（メンバーシップ確認付き）
 */
export async function getCompanyWithMembership(
  companyId: string,
  userId: string,
): Promise<(CompanyWithRole & { isMember: boolean }) | null> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      companies: {
        include: {
          _count: {
            select: {
              users: true,
              jobs: true,
            },
          },
        },
      },
    },
  });

  // ユーザーが存在しない、または会社に所属していない
  if (!user?.companies) {
    return null;
  }

  // 指定された会社と一致しない
  if (user.companies.id !== companyId) {
    return null;
  }

  return {
    id: user.companies.id,
    name: user.companies.name,
    slug: user.companies.slug,
    role: (user.role ?? "member") as CompanyWithRole["role"],
    memberCount: user.companies._count.users,
    jobCount: user.companies._count.jobs,
    createdAt: user.companies.created_at,
    isMember: true,
  };
}
