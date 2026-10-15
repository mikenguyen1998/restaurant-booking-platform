import type { ApiErrorResponse } from '@restaurant-platform/shared';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(new URL(path, baseUrl), {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }
  if (!response.ok) {
    const error = body as Partial<ApiErrorResponse> | undefined;
    const message = Array.isArray(error?.message)
      ? error.message.join('. ')
      : error?.message;
    throw new ApiError(
      response.status,
      message ?? `Không thể hoàn tất yêu cầu (${response.status}).`,
    );
  }
  return body as T;
}
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 501)
    return 'Tính năng đang được hoàn thiện. Chưa có thay đổi nào được lưu.';
  if (error instanceof ApiError && error.status === 401)
    return 'Vui lòng đăng nhập để tiếp tục.';
  return error instanceof Error
    ? error.message
    : 'Có lỗi xảy ra. Vui lòng thử lại.';
}
