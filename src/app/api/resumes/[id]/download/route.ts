import { NextResponse } from "next/server";
import { getUserCompany } from "@/features/companies";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { downloadResumeFile } from "@/lib/db/storage";

/**
 * 履歴書ダウンロードAPI
 * resume.id を指定してPDFファイルを取得
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 認証チェック
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // ユーザーの会社を取得
  const company = await getUserCompany(user.id);
  if (!company) {
    return NextResponse.json(
      { error: "会社に所属していません" },
      { status: 403 },
    );
  }

  const { id } = await params;

  try {
    // 履歴書を取得
    const resume = await prisma.resumes.findUnique({
      where: { id },
      include: {
        applicants: true,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "履歴書が見つかりません" },
        { status: 404 },
      );
    }

    // ユーザーが同じ会社に所属しているかチェック
    if (resume.applicants.company_id !== company.id) {
      return NextResponse.json(
        { error: "この履歴書へのアクセス権限がありません" },
        { status: 403 },
      );
    }

    // ファイルをダウンロード
    const result = await downloadResumeFile(resume.file_url);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // ファイル名を取得（file_nameがなければURLから抽出）
    const fileName = resume.file_name || extractFileName(resume.file_url);

    return new NextResponse(result.data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error) {
    console.error("Resume download error:", error);
    return NextResponse.json(
      { error: "ファイルのダウンロードに失敗しました" },
      { status: 500 },
    );
  }
}

/**
 * URLからファイル名を抽出
 */
function extractFileName(fileUrl: string): string {
  try {
    // ローカルURL: /api/resumes/{companyId}/{applicantId}/{fileName}
    // Supabase URL: https://xxx.supabase.co/storage/v1/object/public/resumes/{path}
    const parts = fileUrl.split("/");
    const lastPart = parts[parts.length - 1];
    // タイムスタンププレフィックスを除去（例: 1734534567890_filename.pdf → filename.pdf）
    const withoutTimestamp = lastPart.replace(/^\d+_/, "");
    return withoutTimestamp || "resume.pdf";
  } catch {
    return "resume.pdf";
  }
}
