"use server";

import { revalidatePath } from "next/cache";
import {
  type AIAnalysis,
  analyzeResume as aiAnalyzeResume,
  extractTextFromPdf,
  extractTextFromPdfWithOcr,
  normalizeExtractedText,
} from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db/client";
import { downloadResumeFile, uploadResumeFile } from "@/lib/db/storage";
import type {
  ActionResult,
  AnalyzeResumeInput,
  Resume,
  UploadResumeInput,
} from "./types";

/**
 * 会社メンバーシップチェック
 */
async function checkCompanyMembership(companyId: string, userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { company_id: true },
  });
  return user?.company_id === companyId;
}

/**
 * 履歴書をアップロード
 */
export async function uploadResume(
  input: UploadResumeInput,
): Promise<ActionResult<{ id: string; fileUrl: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { companyId, applicantId, file } = input;

  // メンバーシップチェック
  const isMember = await checkCompanyMembership(companyId, user.id);
  if (!isMember) {
    return { success: false, error: "この会社へのアクセス権限がありません" };
  }

  // 応募者存在チェック
  const applicant = await prisma.applicants.findFirst({
    where: { id: applicantId, company_id: companyId },
  });

  if (!applicant) {
    return { success: false, error: "応募者が見つかりません" };
  }

  // 既存の履歴書チェック
  const existingResume = await prisma.resumes.findUnique({
    where: { applicant_id: applicantId },
  });

  if (existingResume) {
    return {
      success: false,
      error: "この応募者には既に履歴書が登録されています",
    };
  }

  // ファイルバリデーション
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { success: false, error: "PDFファイルのみアップロード可能です" };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { success: false, error: "ファイルサイズは10MB以下にしてください" };
  }

  // ファイルをBufferに変換
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Storageにアップロード
  const uploadResult = await uploadResumeFile(
    companyId,
    applicantId,
    buffer,
    file.name,
  );

  if (!uploadResult.success) {
    return {
      success: false,
      error: `アップロードに失敗しました: ${uploadResult.error}`,
    };
  }

  // DBに履歴書レコードを作成
  const resume = await prisma.resumes.create({
    data: {
      applicant_id: applicantId,
      file_url: uploadResult.url,
      file_name: file.name,
      analysis_status: "pending",
    },
  });

  revalidatePath(`/applicants/${applicantId}`);

  return {
    success: true,
    data: {
      id: resume.id,
      fileUrl: resume.file_url,
    },
  };
}

/**
 * 履歴書をAI解析
 */
export async function analyzeResume(
  input: AnalyzeResumeInput,
): Promise<ActionResult<Resume>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { companyId, applicantId, resumeId } = input;

  // メンバーシップチェック
  const isMember = await checkCompanyMembership(companyId, user.id);
  if (!isMember) {
    return { success: false, error: "この会社へのアクセス権限がありません" };
  }

  // 履歴書取得
  const resume = await prisma.resumes.findFirst({
    where: {
      id: resumeId,
      applicant_id: applicantId,
      applicants: {
        company_id: companyId,
      },
    },
  });

  if (!resume) {
    return { success: false, error: "履歴書が見つかりません" };
  }

  // 解析中ステータスに更新
  await prisma.resumes.update({
    where: { id: resumeId },
    data: { analysis_status: "processing" },
  });

  try {
    // PDFをダウンロード
    const downloadResult = await downloadResumeFile(resume.file_url);
    if (!downloadResult.success) {
      throw new Error(
        `ファイルのダウンロードに失敗しました: ${downloadResult.error}`,
      );
    }

    // テキスト抽出
    let extractedText = "";
    const pdfResult = await extractTextFromPdf(downloadResult.data);

    if (pdfResult.success) {
      extractedText = normalizeExtractedText(pdfResult.text);
    } else if (pdfResult.code === "EMPTY_CONTENT") {
      // OCRフォールバック
      const ocrResult = await extractTextFromPdfWithOcr(downloadResult.data);
      if (ocrResult.success) {
        extractedText = normalizeExtractedText(ocrResult.text);
      } else {
        throw new Error(
          "テキストを抽出できませんでした。PDFが画像のみで構成されている可能性があります。",
        );
      }
    } else {
      throw new Error(pdfResult.error);
    }

    if (!extractedText) {
      throw new Error("履歴書からテキストを抽出できませんでした");
    }

    // AI解析
    const analysisResult = await aiAnalyzeResume(extractedText);
    if (!analysisResult.success) {
      throw new Error(analysisResult.error);
    }

    // 結果を保存
    const updatedResume = await prisma.resumes.update({
      where: { id: resumeId },
      data: {
        extracted_text: extractedText,
        ai_analysis: JSON.parse(JSON.stringify(analysisResult.analysis)),
        analysis_status: "completed",
        analyzed_at: new Date(),
      },
    });

    revalidatePath(`/applicants/${applicantId}`);

    return {
      success: true,
      data: {
        id: updatedResume.id,
        applicantId: updatedResume.applicant_id,
        fileUrl: updatedResume.file_url,
        fileName: updatedResume.file_name,
        extractedText: updatedResume.extracted_text,
        aiAnalysis: updatedResume.ai_analysis as AIAnalysis | null,
        analysisStatus: "completed",
        analyzedAt: updatedResume.analyzed_at,
        createdAt: updatedResume.created_at,
      },
    };
  } catch (error) {
    // エラー時はステータスを failed に更新
    await prisma.resumes.update({
      where: { id: resumeId },
      data: { analysis_status: "failed" },
    });

    const message =
      error instanceof Error ? error.message : "解析中にエラーが発生しました";
    return { success: false, error: message };
  }
}
