import {
  Errors,
  handleApiError,
  requireTeamMembership,
  success,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db/client";

/**
 * GET /api/teams/:teamId/jobs/:jobId
 * 求人詳細を取得
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string; jobId: string }> },
) {
  try {
    const user = await requireAuth();
    const { teamId, jobId } = await params;

    // チームメンバーシップチェック
    await requireTeamMembership(teamId, user.id);

    // 求人取得
    const job = await prisma.jobs.findFirst({
      where: {
        id: jobId,
        team_id: teamId,
      },
      include: {
        _count: {
          select: { applicants: true },
        },
      },
    });

    if (!job) {
      throw Errors.notFound("求人が見つかりません");
    }

    return success({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      status: job.status,
      applicantCount: job._count.applicants,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/teams/:teamId/jobs/:jobId
 * 求人を更新
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string; jobId: string }> },
) {
  try {
    const user = await requireAuth();
    const { teamId, jobId } = await params;
    const body = await request.json();

    // チームメンバーシップチェック
    await requireTeamMembership(teamId, user.id);

    // 求人が存在するかチェック
    const existingJob = await prisma.jobs.findFirst({
      where: {
        id: jobId,
        team_id: teamId,
      },
    });

    if (!existingJob) {
      throw Errors.notFound("求人が見つかりません");
    }

    // 更新データの構築
    const updateData: {
      title?: string;
      description?: string | null;
      requirements?: string | null;
      status?: string;
    } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || body.title.trim().length === 0) {
        throw Errors.validation("求人タイトルは必須です");
      }
      if (body.title.length > 255) {
        throw Errors.validation("求人タイトルは255文字以内で入力してください");
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description || null;
    }

    if (body.requirements !== undefined) {
      updateData.requirements = body.requirements || null;
    }

    if (body.status !== undefined) {
      if (!["open", "closed"].includes(body.status)) {
        throw Errors.validation(
          "ステータスは open または closed のみ指定可能です",
        );
      }
      updateData.status = body.status;
    }

    // 更新
    const job = await prisma.jobs.update({
      where: { id: jobId },
      data: updateData,
    });

    return success({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      status: job.status,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
