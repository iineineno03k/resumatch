import type { AIAnalysis } from "@/lib/ai";
import prisma from "@/lib/db/client";
import type { AnalysisStatus, Resume } from "./types";

/**
 * 応募者の履歴書を取得
 */
export async function getResumeByApplicantId(
  teamId: string,
  applicantId: string,
): Promise<Resume | null> {
  // まず応募者がチームに所属しているか確認
  const applicant = await prisma.applicants.findFirst({
    where: {
      id: applicantId,
      team_id: teamId,
    },
    select: { id: true },
  });

  if (!applicant) {
    return null;
  }

  const resume = await prisma.resumes.findUnique({
    where: { applicant_id: applicantId },
  });

  if (!resume) {
    return null;
  }

  return {
    id: resume.id,
    applicantId: resume.applicant_id,
    fileUrl: resume.file_url,
    fileName: resume.file_name,
    extractedText: resume.extracted_text,
    aiAnalysis: resume.ai_analysis as AIAnalysis | null,
    analysisStatus: resume.analysis_status as AnalysisStatus,
    analyzedAt: resume.analyzed_at,
    createdAt: resume.created_at,
  };
}

/**
 * 履歴書IDで履歴書を取得
 */
export async function getResumeById(
  teamId: string,
  resumeId: string,
): Promise<Resume | null> {
  const resume = await prisma.resumes.findFirst({
    where: {
      id: resumeId,
      applicants: {
        team_id: teamId,
      },
    },
  });

  if (!resume) {
    return null;
  }

  return {
    id: resume.id,
    applicantId: resume.applicant_id,
    fileUrl: resume.file_url,
    fileName: resume.file_name,
    extractedText: resume.extracted_text,
    aiAnalysis: resume.ai_analysis as AIAnalysis | null,
    analysisStatus: resume.analysis_status as AnalysisStatus,
    analyzedAt: resume.analyzed_at,
    createdAt: resume.created_at,
  };
}
