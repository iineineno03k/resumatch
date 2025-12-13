import prisma from "@/lib/db/client";
import type {
  ApplicantDetail,
  ApplicantFilterOptions,
  ApplicantListItem,
  ApplicantStatus,
  Note,
} from "./types";

/**
 * チームの応募者一覧を取得（フィルタ、ページネーション対応）
 */
export async function getApplicantsByTeamId(
  teamId: string,
  options?: ApplicantFilterOptions,
): Promise<{ applicants: ApplicantListItem[]; total: number }> {
  const page = options?.page ?? 1;
  const limit = Math.min(100, Math.max(1, options?.limit ?? 20));
  const offset = (page - 1) * limit;

  const where = {
    team_id: teamId,
    ...(options?.jobId && { job_id: options.jobId }),
    ...(options?.status && { status: options.status }),
  };

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
          },
        },
      },
      orderBy: { applied_at: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.applicants.count({ where }),
  ]);

  return {
    applicants: applicants.map((a) => {
      const aiAnalysis = a.resumes?.ai_analysis as { summary?: string } | null;
      return {
        id: a.id,
        name: a.name,
        email: a.email,
        status: a.status as ApplicantStatus,
        jobTitle: a.jobs.title,
        appliedAt: a.applied_at,
        hasResume: !!a.resumes,
        aiSummary: aiAnalysis?.summary || null,
      };
    }),
    total,
  };
}

/**
 * 応募者詳細を取得
 */
export async function getApplicantById(
  teamId: string,
  applicantId: string,
): Promise<ApplicantDetail | null> {
  const applicant = await prisma.applicants.findFirst({
    where: {
      id: applicantId,
      team_id: teamId,
    },
    include: {
      jobs: {
        select: { id: true, title: true },
      },
      resumes: {
        select: {
          id: true,
          file_url: true,
          file_name: true,
          analysis_status: true,
          ai_analysis: true,
          analyzed_at: true,
        },
      },
      notes: {
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
      },
    },
  });

  if (!applicant) {
    return null;
  }

  return {
    id: applicant.id,
    name: applicant.name,
    email: applicant.email,
    phone: applicant.phone,
    status: applicant.status as ApplicantStatus,
    appliedAt: applicant.applied_at,
    job: {
      id: applicant.jobs.id,
      title: applicant.jobs.title,
    },
    resume: applicant.resumes
      ? {
          id: applicant.resumes.id,
          fileUrl: applicant.resumes.file_url,
          fileName: applicant.resumes.file_name,
          analysisStatus: applicant.resumes.analysis_status,
          aiAnalysis: applicant.resumes.ai_analysis,
          analyzedAt: applicant.resumes.analyzed_at,
        }
      : null,
    notes: applicant.notes.map((note) => ({
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
  };
}

/**
 * 応募者のメモ一覧を取得
 */
export async function getNotesByApplicantId(
  applicantId: string,
): Promise<Note[]> {
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

  return notes.map((note) => ({
    id: note.id,
    content: note.content,
    rating: note.rating,
    user: {
      id: note.users.id,
      name: note.users.name,
      avatarUrl: note.users.avatar_url,
    },
    createdAt: note.created_at,
  }));
}
