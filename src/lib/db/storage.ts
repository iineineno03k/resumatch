import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Storage クライアント
 * 履歴書PDFのアップロード・ダウンロードに使用
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * 履歴書ファイルをStorageにアップロード
 * @param companyId 会社ID
 * @param applicantId 応募者ID
 * @param file ファイルデータ
 * @param fileName ファイル名
 * @returns アップロード結果
 */
export async function uploadResumeFile(
  companyId: string,
  applicantId: string,
  file: Buffer | Uint8Array,
  fileName: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const filePath = `${companyId}/${applicantId}/${Date.now()}_${fileName}`;

  const { error } = await supabaseAdmin.storage
    .from("resumes")
    .upload(filePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("resumes")
    .getPublicUrl(filePath);

  return { success: true, url: urlData.publicUrl };
}

/**
 * 履歴書ファイルをStorageから取得
 * @param fileUrl ファイルURL（またはパス）
 * @returns ファイルデータ
 */
export async function downloadResumeFile(
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

  const { data, error } = await supabaseAdmin.storage
    .from("resumes")
    .download(filePath);

  if (error) {
    return { success: false, error: error.message };
  }

  const arrayBuffer = await data.arrayBuffer();
  return { success: true, data: arrayBuffer };
}
