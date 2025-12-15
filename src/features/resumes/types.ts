import type { AIAnalysis } from "@/lib/ai";

/**
 * 履歴書の解析ステータス
 */
export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

/**
 * 履歴書データ
 */
export type Resume = {
  id: string;
  applicantId: string;
  fileUrl: string;
  fileName: string | null;
  extractedText: string | null;
  aiAnalysis: AIAnalysis | null;
  analysisStatus: AnalysisStatus;
  analyzedAt: Date | null;
  createdAt: Date | null;
};

/**
 * 履歴書アップロードの入力
 */
export type UploadResumeInput = {
  companyId: string;
  applicantId: string;
  file: File;
};

/**
 * 履歴書解析の入力
 */
export type AnalyzeResumeInput = {
  companyId: string;
  applicantId: string;
  resumeId: string;
};

/**
 * Server Action の結果
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
