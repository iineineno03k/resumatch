"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db/client";
import type {
  ActionResult,
  ApplicantStatus,
  CreateApplicantInput,
  CreateNoteInput,
  Note,
  UpdateApplicantInput,
} from "./types";

const VALID_STATUSES: ApplicantStatus[] = [
  "screening",
  "first_interview",
  "second_interview",
  "final_interview",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
];

/**
 * メンバーシップチェック
 */
async function checkMembership(teamId: string, userId: string) {
  const membership = await prisma.team_members.findUnique({
    where: {
      team_id_user_id: {
        team_id: teamId,
        user_id: userId,
      },
    },
  });
  return membership !== null;
}

/**
 * 応募者を登録
 */
export async function createApplicant(
  input: CreateApplicantInput,
): Promise<ActionResult<{ id: string; name: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { teamId, jobId, name, email, phone } = input;

  // メンバーシップチェック
  const isMember = await checkMembership(teamId, user.id);
  if (!isMember) {
    return { success: false, error: "このチームへのアクセス権限がありません" };
  }

  // バリデーション
  if (!name || name.trim().length === 0) {
    return { success: false, error: "氏名は必須です" };
  }

  if (name.length > 255) {
    return { success: false, error: "氏名は255文字以内で入力してください" };
  }

  // 求人存在チェック
  const job = await prisma.jobs.findFirst({
    where: { id: jobId, team_id: teamId },
  });

  if (!job) {
    return { success: false, error: "求人が見つかりません" };
  }

  // 応募者作成
  const applicant = await prisma.applicants.create({
    data: {
      team_id: teamId,
      job_id: jobId,
      name: name.trim(),
      email: email || null,
      phone: phone || null,
      status: "screening",
    },
  });

  revalidatePath(`/teams/${teamId}/applicants`);

  return {
    success: true,
    data: {
      id: applicant.id,
      name: applicant.name,
    },
  };
}

/**
 * 応募者を更新
 */
export async function updateApplicant(
  input: UpdateApplicantInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { teamId, applicantId, name, email, phone, status } = input;

  // メンバーシップチェック
  const isMember = await checkMembership(teamId, user.id);
  if (!isMember) {
    return { success: false, error: "このチームへのアクセス権限がありません" };
  }

  // 応募者存在チェック
  const existingApplicant = await prisma.applicants.findFirst({
    where: { id: applicantId, team_id: teamId },
  });

  if (!existingApplicant) {
    return { success: false, error: "応募者が見つかりません" };
  }

  // 更新データ構築
  const updateData: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    status?: string;
  } = {};

  if (name !== undefined) {
    if (name.trim().length === 0) {
      return { success: false, error: "氏名は必須です" };
    }
    if (name.length > 255) {
      return { success: false, error: "氏名は255文字以内で入力してください" };
    }
    updateData.name = name.trim();
  }

  if (email !== undefined) {
    updateData.email = email || null;
  }

  if (phone !== undefined) {
    updateData.phone = phone || null;
  }

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        error: `ステータスは ${VALID_STATUSES.join(", ")} のいずれかを指定してください`,
      };
    }
    updateData.status = status;
  }

  // 更新
  await prisma.applicants.update({
    where: { id: applicantId },
    data: updateData,
  });

  revalidatePath(`/teams/${teamId}/applicants`);
  revalidatePath(`/teams/${teamId}/applicants/${applicantId}`);

  return {
    success: true,
    data: { id: applicantId },
  };
}

/**
 * メモを追加
 */
export async function createNote(
  input: CreateNoteInput,
): Promise<ActionResult<Note>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { teamId, applicantId, content, rating } = input;

  // メンバーシップチェック
  const isMember = await checkMembership(teamId, user.id);
  if (!isMember) {
    return { success: false, error: "このチームへのアクセス権限がありません" };
  }

  // 応募者存在チェック
  const applicant = await prisma.applicants.findFirst({
    where: { id: applicantId, team_id: teamId },
  });

  if (!applicant) {
    return { success: false, error: "応募者が見つかりません" };
  }

  // バリデーション
  if (!content || content.trim().length === 0) {
    return { success: false, error: "メモ内容は必須です" };
  }

  if (rating !== undefined && rating !== null) {
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return { success: false, error: "評価は1〜5の整数で指定してください" };
    }
  }

  // メモ作成
  const note = await prisma.notes.create({
    data: {
      applicant_id: applicantId,
      user_id: user.id,
      content: content.trim(),
      rating: rating || null,
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
        },
      },
    },
  });

  revalidatePath(`/teams/${teamId}/applicants/${applicantId}`);

  return {
    success: true,
    data: {
      id: note.id,
      content: note.content,
      rating: note.rating,
      user: {
        id: note.users.id,
        name: note.users.name,
        avatarUrl: note.users.avatar_url,
      },
      createdAt: note.created_at,
    },
  };
}
