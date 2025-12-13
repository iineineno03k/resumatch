"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db/client";
import type { ActionResult, Team } from "./types";

/**
 * チームを作成
 */
export async function createTeam(input: {
  name: string;
}): Promise<ActionResult<Team>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { name } = input;

  // バリデーション
  if (!name || name.trim().length === 0) {
    return { success: false, error: "チーム名は必須です" };
  }

  if (name.length > 255) {
    return { success: false, error: "チーム名は255文字以内で入力してください" };
  }

  // slug を生成
  const slug = generateSlug(name);

  // slug の重複チェック
  const existingTeam = await prisma.teams.findUnique({
    where: { slug },
  });

  if (existingTeam) {
    return { success: false, error: "このチーム名はすでに使用されています" };
  }

  // トランザクションでチーム作成とメンバー追加
  const team = await prisma.$transaction(async (tx) => {
    const newTeam = await tx.teams.create({
      data: {
        name: name.trim(),
        slug,
      },
    });

    await tx.team_members.create({
      data: {
        team_id: newTeam.id,
        user_id: user.id,
        role: "owner",
      },
    });

    return newTeam;
  });

  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: team.id,
      name: team.name,
      slug: team.slug,
      createdAt: team.created_at,
    },
  };
}

/**
 * チーム名からslugを生成
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
    slug = `team-${Date.now().toString(36)}`;
  }

  if (slug.length > 100) {
    slug = slug.substring(0, 100).replace(/-$/, "");
  }

  slug = `${slug}-${Date.now().toString(36)}`;

  return slug;
}
