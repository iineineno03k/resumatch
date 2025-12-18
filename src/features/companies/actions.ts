"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db/client";
import type { ActionResult, Company } from "./types";

/**
 * 会社を作成（オーナーとして）
 */
export async function createCompany(input: {
  name: string;
}): Promise<ActionResult<Company>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  // すでに会社に所属している場合はエラー
  const existingUser = await prisma.users.findUnique({
    where: { id: user.id },
    select: { company_id: true },
  });

  if (existingUser?.company_id) {
    return { success: false, error: "すでに会社に所属しています" };
  }

  const { name } = input;

  // バリデーション
  if (!name || name.trim().length === 0) {
    return { success: false, error: "会社名は必須です" };
  }

  if (name.length > 255) {
    return { success: false, error: "会社名は255文字以内で入力してください" };
  }

  // slug を生成
  const slug = generateSlug(name);

  // slug の重複チェック
  const existingCompany = await prisma.companies.findUnique({
    where: { slug },
  });

  if (existingCompany) {
    return { success: false, error: "この会社名はすでに使用されています" };
  }

  // トランザクションで会社作成とユーザー更新
  const company = await prisma.$transaction(async (tx) => {
    const newCompany = await tx.companies.create({
      data: {
        name: name.trim(),
        slug,
      },
    });

    await tx.users.update({
      where: { id: user.id },
      data: {
        company_id: newCompany.id,
        role: "owner",
      },
    });

    return newCompany;
  });

  revalidatePath("/jobs");

  return {
    success: true,
    data: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      createdAt: company.created_at,
    },
  };
}

/**
 * 会社名からslugを生成
 */
function generateSlug(name: string): string {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[\s　]+/g, "-")
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    slug = `company-${Date.now().toString(36)}`;
  }

  if (slug.length > 100) {
    slug = slug.substring(0, 100).replace(/-$/, "");
  }

  slug = `${slug}-${Date.now().toString(36)}`;

  return slug;
}
