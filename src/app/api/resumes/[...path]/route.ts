import * as fs from "node:fs/promises";
import * as path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * ローカル開発用のファイル配信API
 * 本番環境ではSupabase Storageを使用するため、このAPIは使用されない
 */

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "uploads", "resumes");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  // 認証チェック
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { path: pathSegments } = await params;
  const filePath = path.join(LOCAL_STORAGE_DIR, ...pathSegments);

  // パストラバーサル攻撃を防ぐ
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(LOCAL_STORAGE_DIR)) {
    return NextResponse.json(
      { error: "無効なファイルパスです" },
      { status: 400 },
    );
  }

  try {
    const fileBuffer = await fs.readFile(normalizedPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pathSegments[pathSegments.length - 1]}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "ファイルが見つかりません" },
      { status: 404 },
    );
  }
}
