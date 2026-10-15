'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from './api';

export function useResource<T>(path: string | null) {
  const [attempt, setAttempt] = useState(0);
  const key = `${path}:${attempt}`;
  const [result, setResult] = useState<{
    key: string;
    data?: T;
    error?: unknown;
  }>({ key: '' });
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    apiRequest<T>(path, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setResult({ key, error });
      },
    );
    return () => controller.abort();
  }, [path, key]);
  return {
    data: result.key === key ? result.data : undefined,
    error: result.key === key ? result.error : undefined,
    loading: path !== null && result.key !== key,
    reload: () => setAttempt((n) => n + 1),
  };
}
