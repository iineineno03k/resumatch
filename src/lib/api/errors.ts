import { NextResponse } from "next/server";

/**
 * API エラーコード
 */
export const ErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * エラーコードと HTTP ステータスのマッピング
 */
const ERROR_STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  INTERNAL_ERROR: 500,
};

/**
 * API エラークラス
 */
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get status(): number {
    return ERROR_STATUS[this.code];
  }

  toResponse(): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: this.code,
          message: this.message,
        },
      },
      { status: this.status },
    );
  }
}

/**
 * エラーハンドラー
 * try-catch で捕捉したエラーを適切なレスポンスに変換
 */
export function handleApiError(error: unknown): NextResponse {
  // ApiError の場合はそのまま返す
  if (error instanceof ApiError) {
    return error.toResponse();
  }

  // 認証エラー（requireAuth からスローされる）
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return new ApiError(ErrorCode.UNAUTHORIZED, "認証が必要です").toResponse();
  }

  // その他のエラーは 500 として処理
  console.error("Unexpected error:", error);
  return new ApiError(
    ErrorCode.INTERNAL_ERROR,
    "サーバーエラーが発生しました",
  ).toResponse();
}

// 便利なファクトリ関数
export const Errors = {
  unauthorized: (message = "認証が必要です") =>
    new ApiError(ErrorCode.UNAUTHORIZED, message),

  forbidden: (message = "アクセス権限がありません") =>
    new ApiError(ErrorCode.FORBIDDEN, message),

  notFound: (message = "リソースが見つかりません") =>
    new ApiError(ErrorCode.NOT_FOUND, message),

  validation: (message: string) =>
    new ApiError(ErrorCode.VALIDATION_ERROR, message),

  internal: (message = "サーバーエラーが発生しました") =>
    new ApiError(ErrorCode.INTERNAL_ERROR, message),
};
