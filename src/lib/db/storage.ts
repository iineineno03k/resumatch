import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ストレージアダプター
 * 開発環境: ローカルファイルシステム（USE_LOCAL_STORAGE=true）
 * 本番環境: Supabase Storage
 */

/**
 * ローカルストレージを使用するかどうか（実行時に評価）
 */
function useLocalStorage(): boolean {
  return process.env.USE_LOCAL_STORAGE === "true";
}

function getLocalStorageDir(): string {
  return path.join(process.cwd(), "uploads", "resumes");
}

// ========== Supabase Storage ==========

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

// ========== Local File Storage ==========

async function ensureLocalDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {
    // ディレクトリが既に存在する場合は無視
  }
}

async function uploadLocal(
  companyId: string,
  applicantId: string,
  file: Buffer | Uint8Array,
  fileName: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const dirPath = path.join(getLocalStorageDir(), companyId, applicantId);
    await ensureLocalDir(dirPath);

    const safeFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(dirPath, safeFileName);

    await fs.writeFile(filePath, file);

    // ローカルURLを返す（API経由でアクセス）
    const url = `/api/resumes/${companyId}/${applicantId}/${safeFileName}`;
    return { success: true, url };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ファイル保存に失敗しました";
    return { success: false, error: message };
  }
}

async function downloadLocal(
  fileUrl: string,
): Promise<
  { success: true; data: ArrayBuffer } | { success: false; error: string }
> {
  try {
    // URL形式: /api/resumes/{companyId}/{applicantId}/{fileName}
    const match = fileUrl.match(/\/api\/resumes\/(.+)$/);
    if (!match) {
      return { success: false, error: "無効なファイルURLです" };
    }

    const relativePath = match[1];
    const filePath = path.join(getLocalStorageDir(), relativePath);

    const buffer = await fs.readFile(filePath);
    return {
      success: true,
      data: buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      ),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ファイル読み込みに失敗しました";
    return { success: false, error: message };
  }
}

// ========== Supabase Storage ==========

async function uploadSupabase(
  companyId: string,
  applicantId: string,
  file: Buffer | Uint8Array,
  fileName: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  // 日本語などの非ASCII文字をサニタイズ
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${companyId}/${applicantId}/${Date.now()}_${safeFileName}`;

  const { error } = await getSupabaseAdmin()
    .storage.from("resumes")
    .upload(filePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: urlData } = getSupabaseAdmin()
    .storage.from("resumes")
    .getPublicUrl(filePath);

  return { success: true, url: urlData.publicUrl };
}

async function downloadSupabase(
  fileUrl: string,
): Promise<
  { success: true; data: ArrayBuffer } | { success: false; error: string }
> {
  // URLからパスを抽出
  const url = new URL(fileUrl);
  const pathMatch = url.pathname.match(
    /\/storage\/v1\/object\/public\/resumes\/(.+)/,
  );
  const filePath = pathMatch ? pathMatch[1] : fileUrl;

  const { data, error } = await getSupabaseAdmin()
    .storage.from("resumes")
    .download(filePath);

  if (error) {
    return { success: false, error: error.message };
  }

  const arrayBuffer = await data.arrayBuffer();
  return { success: true, data: arrayBuffer };
}

// ========== Public API ==========

/**
 * 履歴書ファイルをStorageにアップロード
 * USE_LOCAL_STORAGE=true の場合はローカルファイルシステムを使用
 */
export async function uploadResumeFile(
  companyId: string,
  applicantId: string,
  file: Buffer | Uint8Array,
  fileName: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  if (useLocalStorage()) {
    return uploadLocal(companyId, applicantId, file, fileName);
  }
  return uploadSupabase(companyId, applicantId, file, fileName);
}

/**
 * 履歴書ファイルをStorageから取得
 * USE_LOCAL_STORAGE=true の場合はローカルファイルシステムから取得
 */
export async function downloadResumeFile(
  fileUrl: string,
): Promise<
  { success: true; data: ArrayBuffer } | { success: false; error: string }
> {
  if (useLocalStorage()) {
    return downloadLocal(fileUrl);
  }
  return downloadSupabase(fileUrl);
}
