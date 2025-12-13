import { NextResponse } from "next/server";

/**
 * 成功レスポンスを返す
 */
export function success<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * 作成成功レスポンスを返す（201）
 */
export function created<T>(data: T): NextResponse<T> {
  return success(data, 201);
}

/**
 * ページネーション付きレスポンス
 */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

/**
 * ページネーション付きレスポンスを作成
 */
export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): NextResponse<PaginatedResponse<T>> {
  return success({
    data,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  });
}

/**
 * URL パラメータからページネーション情報を取得
 */
export function getPaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit")) || 20),
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
