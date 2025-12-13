import type { Prisma } from "@prisma/client";
import {
  created,
  Errors,
  getPaginationParams,
  handleApiError,
  requireTeamMembership,
  success,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db/client";

/**
 * GET /api/teams/:teamId/applicants
 * 応募者一覧を取得（フィルタ、ページネーション対応）
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
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");
    const { page, limit, offset } = getPaginationParams(searchParams);

    // 検索条件
    const where: Prisma.applicantsWhereInput = {
      team_id: teamId,
      ...(jobId && { job_id: jobId }),
      ...(status && { status }),
    };

    // 応募者一覧取得
    const [applicants, total] = await Promise.all([
      prisma.applicants.findMany({
        where,
        include: {
          jobs: {
            select: { title: true },
          },
          resumes: {
            select: {
              id: true,
              ai_analysis: true,
              analysis_status: true,
            },
          },
        },
        orderBy: { applied_at: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.applicants.count({ where }),
    ]);

    return success({
      applicants: applicants.map((a) => {
        const aiAnalysis = a.resumes?.ai_analysis as {
          summary?: string;
        } | null;
        return {
          id: a.id,
          name: a.name,
          email: a.email,
          status: a.status,
          jobTitle: a.jobs.title,
          appliedAt: a.applied_at,
          hasResume: !!a.resumes,
          aiSummary: aiAnalysis?.summary || null,
        };
      }),
      total,
      page,
      limit,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/teams/:teamId/applicants
 * 新しい応募者を登録
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
    const { jobId, name, email, phone } = body;

    if (!jobId || typeof jobId !== "string") {
      throw Errors.validation("求人IDは必須です");
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw Errors.validation("氏名は必須です");
    }

    if (name.length > 255) {
      throw Errors.validation("氏名は255文字以内で入力してください");
    }

    // 求人が存在するかチェック
    const job = await prisma.jobs.findFirst({
      where: {
        id: jobId,
        team_id: teamId,
      },
    });

    if (!job) {
      throw Errors.notFound("求人が見つかりません");
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
      include: {
        jobs: {
          select: { title: true },
        },
      },
    });

    return created({
      id: applicant.id,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      status: applicant.status,
      jobId: applicant.job_id,
      jobTitle: applicant.jobs.title,
      appliedAt: applicant.applied_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
