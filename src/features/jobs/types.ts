/**
 * 求人のステータス
 */
export type JobStatus = "open" | "closed";

/**
 * 求人情報
 */
export type Job = {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  status: JobStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * 求人一覧表示用
 */
export type JobListItem = {
  id: string;
  title: string;
  status: JobStatus;
  applicantCount: number;
  createdAt: Date | null;
};

/**
 * 求人作成の入力
 */
export type CreateJobInput = {
  teamId: string;
  title: string;
  description?: string;
  requirements?: string;
};

/**
 * 求人更新の入力
 */
export type UpdateJobInput = {
  teamId: string;
  jobId: string;
  title?: string;
  description?: string;
  requirements?: string;
  status?: JobStatus;
};

/**
 * Server Action の結果
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
