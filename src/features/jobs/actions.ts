"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db/client";
import type {
  ActionResult,
  CreateJobInput,
  Job,
  UpdateJobInput,
} from "./types";

/**
 * 会社メンバーシップチェック
 */
async function checkCompanyMembership(companyId: string, userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { company_id: true },
  });
  return user?.company_id === companyId;
}

/**
 * 求人を作成
 */
export async function createJob(
  input: CreateJobInput,
): Promise<ActionResult<Job>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { companyId, title, description, requirements } = input;

  // メンバーシップチェック
  const isMember = await checkCompanyMembership(companyId, user.id);
  if (!isMember) {
    return { success: false, error: "この会社へのアクセス権限がありません" };
  }

  // バリデーション
  if (!title || title.trim().length === 0) {
    return { success: false, error: "求人タイトルは必須です" };
  }

  if (title.length > 255) {
    return {
      success: false,
      error: "求人タイトルは255文字以内で入力してください",
    };
  }

  // 求人作成
  const job = await prisma.jobs.create({
    data: {
      company_id: companyId,
      title: title.trim(),
      description: description || null,
      requirements: requirements || null,
      status: "open",
    },
  });

  revalidatePath(`/jobs`);

  return {
    success: true,
    data: {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      status: job.status as Job["status"],
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    },
  };
}

/**
 * 求人を更新
 */
export async function updateJob(
  input: UpdateJobInput,
): Promise<ActionResult<Job>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { companyId, jobId, title, description, requirements, status } = input;

  // メンバーシップチェック
  const isMember = await checkCompanyMembership(companyId, user.id);
  if (!isMember) {
    return { success: false, error: "この会社へのアクセス権限がありません" };
  }

  // 求人存在チェック
  const existingJob = await prisma.jobs.findFirst({
    where: { id: jobId, company_id: companyId },
  });

  if (!existingJob) {
    return { success: false, error: "求人が見つかりません" };
  }

  // 更新データ構築
  const updateData: {
    title?: string;
    description?: string | null;
    requirements?: string | null;
    status?: string;
  } = {};

  if (title !== undefined) {
    if (title.trim().length === 0) {
      return { success: false, error: "求人タイトルは必須です" };
    }
    if (title.length > 255) {
      return {
        success: false,
        error: "求人タイトルは255文字以内で入力してください",
      };
    }
    updateData.title = title.trim();
  }

  if (description !== undefined) {
    updateData.description = description || null;
  }

  if (requirements !== undefined) {
    updateData.requirements = requirements || null;
  }

  if (status !== undefined) {
    if (!["open", "closed"].includes(status)) {
      return {
        success: false,
        error: "ステータスは open または closed のみ指定可能です",
      };
    }
    updateData.status = status;
  }

  // 更新
  const job = await prisma.jobs.update({
    where: { id: jobId },
    data: updateData,
  });

  revalidatePath(`/jobs`);
  revalidatePath(`/jobs/${jobId}`);

  return {
    success: true,
    data: {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      status: job.status as Job["status"],
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    },
  };
}
