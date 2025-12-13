import {
  created,
  Errors,
  handleApiError,
  requireTeamMembership,
  success,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db/client";

/**
 * GET /api/teams/:teamId/jobs
 * 求人一覧を取得
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const user = await requireAuth();
    const { teamId } = await params;

    // チームメンバーシップチェック
    await requireTeamMembership(teamId, user.id);

    // クエリパラメータ
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // 求人一覧取得
    const jobs = await prisma.jobs.findMany({
      where: {
        team_id: teamId,
        ...(status && { status }),
      },
      include: {
        _count: {
          select: { applicants: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return success({
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        applicantCount: job._count.applicants,
        createdAt: job.created_at,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/teams/:teamId/jobs
 * 新しい求人を作成
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const user = await requireAuth();
    const { teamId } = await params;
    const body = await request.json();

    // チームメンバーシップチェック
    await requireTeamMembership(teamId, user.id);

    // バリデーション
    const { title, description, requirements } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      throw Errors.validation("求人タイトルは必須です");
    }

    if (title.length > 255) {
      throw Errors.validation("求人タイトルは255文字以内で入力してください");
    }

    // 求人作成
    const job = await prisma.jobs.create({
      data: {
        team_id: teamId,
        title: title.trim(),
        description: description || null,
        requirements: requirements || null,
        status: "open",
      },
    });

    return created({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      status: job.status,
      createdAt: job.created_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
