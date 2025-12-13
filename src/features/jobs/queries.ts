import prisma from "@/lib/db/client";
import type { Job, JobListItem, JobStatus } from "./types";

/**
 * チームの求人一覧を取得
 */
export async function getJobsByTeamId(
  teamId: string,
  options?: { status?: JobStatus },
): Promise<JobListItem[]> {
  const jobs = await prisma.jobs.findMany({
    where: {
      team_id: teamId,
      ...(options?.status && { status: options.status }),
    },
    include: {
      _count: {
        select: { applicants: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status as JobStatus,
    applicantCount: job._count.applicants,
    createdAt: job.created_at,
  }));
}

/**
 * 求人詳細を取得
 */
export async function getJobById(
  teamId: string,
  jobId: string,
): Promise<(Job & { applicantCount: number }) | null> {
  const job = await prisma.jobs.findFirst({
    where: {
      id: jobId,
      team_id: teamId,
    },
    include: {
      _count: {
        select: { applicants: true },
      },
    },
  });

  if (!job) {
    return null;
  }

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    status: job.status as JobStatus,
    applicantCount: job._count.applicants,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}
