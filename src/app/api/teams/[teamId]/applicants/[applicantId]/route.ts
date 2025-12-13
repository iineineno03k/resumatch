import {
  Errors,
  handleApiError,
  requireTeamMembership,
  success,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db/client";

/** 有効なステータス値 */
const VALID_STATUSES = [
  "screening",
  "first_interview",
  "second_interview",
  "final_interview",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

/**
 * GET /api/teams/:teamId/applicants/:applicantId
 * 応募者詳細を取得
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string; applicantId: string }> },
) {
  try {
    const user = await requireAuth();
    const { teamId, applicantId } = await params;

    // チームメンバーシップチェック
    await requireTeamMembership(teamId, user.id);

    // 応募者取得
    const applicant = await prisma.applicants.findFirst({
      where: {
        id: applicantId,
        team_id: teamId,
      },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
          },
        },
        resumes: {
          select: {
            id: true,
            file_url: true,
            file_name: true,
            analysis_status: true,
            ai_analysis: true,
            analyzed_at: true,
          },
        },
        notes: {
          include: {
            users: {
              select: {
                name: true,
                avatar_url: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!applicant) {
      throw Errors.notFound("応募者が見つかりません");
    }

    return success({
      id: applicant.id,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      status: applicant.status,
      appliedAt: applicant.applied_at,
      job: {
        id: applicant.jobs.id,
        title: applicant.jobs.title,
      },
      resume: applicant.resumes
        ? {
            id: applicant.resumes.id,
            fileUrl: applicant.resumes.file_url,
            fileName: applicant.resumes.file_name,
            analysisStatus: applicant.resumes.analysis_status,
            aiAnalysis: applicant.resumes.ai_analysis,
            analyzedAt: applicant.resumes.analyzed_at,
          }
        : null,
      notes: applicant.notes.map((note) => ({
        id: note.id,
        content: note.content,
        rating: note.rating,
        user: {
          name: note.users.name,
          avatarUrl: note.users.avatar_url,
        },
        createdAt: note.created_at,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/teams/:teamId/applicants/:applicantId
 * 応募者を更新
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string; applicantId: string }> },
) {
  try {
    const user = await requireAuth();
    const { teamId, applicantId } = await params;
    const body = await request.json();

    // チームメンバーシップチェック
    await requireTeamMembership(teamId, user.id);

    // 応募者が存在するかチェック
    const existingApplicant = await prisma.applicants.findFirst({
      where: {
        id: applicantId,
        team_id: teamId,
      },
    });

    if (!existingApplicant) {
      throw Errors.notFound("応募者が見つかりません");
    }

    // 更新データの構築
    const updateData: {
      name?: string;
      email?: string | null;
      phone?: string | null;
      status?: string;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        throw Errors.validation("氏名は必須です");
      }
      if (body.name.length > 255) {
        throw Errors.validation("氏名は255文字以内で入力してください");
      }
      updateData.name = body.name.trim();
    }

    if (body.email !== undefined) {
      updateData.email = body.email || null;
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone || null;
    }

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        throw Errors.validation(
          `ステータスは ${VALID_STATUSES.join(", ")} のいずれかを指定してください`,
        );
      }
      updateData.status = body.status;
    }

    // 更新
    const applicant = await prisma.applicants.update({
      where: { id: applicantId },
      data: updateData,
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return success({
      id: applicant.id,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      status: applicant.status,
      job: {
        id: applicant.jobs.id,
        title: applicant.jobs.title,
      },
      appliedAt: applicant.applied_at,
      updatedAt: applicant.updated_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
