/**
 * 応募者のステータス
 */
export type ApplicantStatus =
  | "screening"
  | "first_interview"
  | "second_interview"
  | "final_interview"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";

/**
 * 応募者一覧表示用
 */
export type ApplicantListItem = {
  id: string;
  name: string;
  email: string | null;
  status: ApplicantStatus;
  jobTitle: string;
  appliedAt: Date | null;
  hasResume: boolean;
  aiSummary: string | null;
};

/**
 * 応募者詳細
 */
export type ApplicantDetail = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: ApplicantStatus;
  appliedAt: Date | null;
  job: {
    id: string;
    title: string;
  };
  resume: {
    id: string;
    fileUrl: string;
    fileName: string | null;
    analysisStatus: string;
    aiAnalysis: unknown;
    analyzedAt: Date | null;
  } | null;
  notes: Note[];
};

/**
 * メモ
 */
export type Note = {
  id: string;
  content: string;
  rating: number | null;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  createdAt: Date | null;
};

/**
 * 応募者作成の入力
 */
export type CreateApplicantInput = {
  companyId: string;
  jobId: string;
  name: string;
  email?: string;
  phone?: string;
};

/**
 * 応募者更新の入力
 */
export type UpdateApplicantInput = {
  companyId: string;
  applicantId: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: ApplicantStatus;
};

/**
 * メモ追加の入力
 */
export type CreateNoteInput = {
  companyId: string;
  applicantId: string;
  content: string;
  rating?: number;
};

/**
 * ページネーションオプション
 */
export type PaginationOptions = {
  page?: number;
  limit?: number;
};

/**
 * フィルターオプション
 */
export type ApplicantFilterOptions = {
  jobId?: string;
  status?: ApplicantStatus;
} & PaginationOptions;

/**
 * Server Action の結果
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
