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
 * GET /api/teams/:teamId/applicants/:applicantId/notes
 * メモ一覧を取得
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

    // 応募者が存在するかチェック
    const applicant = await prisma.applicants.findFirst({
      where: {
        id: applicantId,
        team_id: teamId,
      },
    });

    if (!applicant) {
      throw Errors.notFound("応募者が見つかりません");
    }

    // メモ一覧取得
    const notes = await prisma.notes.findMany({
      where: { applicant_id: applicantId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return success({
      notes: notes.map((note) => ({
        id: note.id,
        content: note.content,
        rating: note.rating,
        user: {
          id: note.users.id,
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
 * POST /api/teams/:teamId/applicants/:applicantId/notes
 * メモを追加
 */
export async function POST(
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
    const applicant = await prisma.applicants.findFirst({
      where: {
        id: applicantId,
        team_id: teamId,
      },
    });

    if (!applicant) {
      throw Errors.notFound("応募者が見つかりません");
    }

    // バリデーション
    const { content, rating } = body;

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      throw Errors.validation("メモ内容は必須です");
    }

    if (rating !== undefined && rating !== null) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        throw Errors.validation("評価は1〜5の整数で指定してください");
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

    return created({
      id: note.id,
      content: note.content,
      rating: note.rating,
      user: {
        id: note.users.id,
        name: note.users.name,
        avatarUrl: note.users.avatar_url,
      },
      createdAt: note.created_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
