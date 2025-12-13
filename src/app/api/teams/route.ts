import { created, Errors, handleApiError, success } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db/client";

/**
 * GET /api/teams
 * 自分が所属するチーム一覧を取得
 */
export async function GET() {
  try {
    const user = await requireAuth();

    // ユーザーが所属するチームを取得
    const memberships = await prisma.team_members.findMany({
      where: { user_id: user.id },
      include: {
        teams: {
          include: {
            _count: {
              select: {
                team_members: true,
                jobs: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const teams = memberships.map((m) => ({
      id: m.teams.id,
      name: m.teams.name,
      slug: m.teams.slug,
      role: m.role,
      memberCount: m.teams._count.team_members,
      jobCount: m.teams._count.jobs,
      createdAt: m.teams.created_at,
    }));

    return success({ teams });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/teams
 * 新しいチームを作成
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // バリデーション
    const { name } = body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw Errors.validation("チーム名は必須です");
    }

    if (name.length > 255) {
      throw Errors.validation("チーム名は255文字以内で入力してください");
    }

    // slug を生成（name から）
    const slug = generateSlug(name);

    // slug の重複チェック
    const existingTeam = await prisma.teams.findUnique({
      where: { slug },
    });

    if (existingTeam) {
      throw Errors.validation("このチーム名はすでに使用されています");
    }

    // トランザクションでチーム作成とメンバー追加を実行
    const team = await prisma.$transaction(async (tx) => {
      // チーム作成
      const newTeam = await tx.teams.create({
        data: {
          name: name.trim(),
          slug,
        },
      });

      // 作成者をオーナーとして追加
      await tx.team_members.create({
        data: {
          team_id: newTeam.id,
          user_id: user.id,
          role: "owner",
        },
      });

      return newTeam;
    });

    return created({
      id: team.id,
      name: team.name,
      slug: team.slug,
      role: "owner",
      createdAt: team.created_at,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * チーム名からslugを生成
 */
function generateSlug(name: string): string {
  // 基本のslugを作成（小文字、空白はハイフンに）
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[\s　]+/g, "-") // 空白（全角含む）をハイフンに
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, "") // 英数字、ひらがな、カタカナ、漢字、ハイフン以外を削除
    .replace(/-+/g, "-") // 連続ハイフンを1つに
    .replace(/^-|-$/g, ""); // 先頭・末尾のハイフンを削除

  // 空の場合はランダム文字列
  if (!slug) {
    slug = `team-${Date.now().toString(36)}`;
  }

  // 100文字以内に制限
  if (slug.length > 100) {
    slug = slug.substring(0, 100).replace(/-$/, "");
  }

  // ユニーク性のためにタイムスタンプを追加
  slug = `${slug}-${Date.now().toString(36)}`;

  return slug;
}
