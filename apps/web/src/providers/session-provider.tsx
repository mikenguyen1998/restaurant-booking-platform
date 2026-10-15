'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { CurrentAccount } from '@restaurant-platform/shared';
import { apiRequest, ApiError } from '@/lib/api';

type SessionState = {
  account: CurrentAccount | null;
  loading: boolean;
  error: string | null;
};
type SessionContextValue = SessionState & { refresh: () => Promise<void> };
const SessionContext = createContext<SessionContextValue | null>(null);
async function readSession(
  signal?: AbortSignal,
): Promise<Omit<SessionState, 'loading'>> {
  try {
    return {
      account: await apiRequest<CurrentAccount>('/me', { signal }),
      error: null,
    };
  } catch (error) {
    return {
      account: null,
      error:
        error instanceof ApiError && error.status === 401
          ? null
          : 'Chưa kết nối được với máy chủ.',
    };
  }
}
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    account: null,
    loading: true,
    error: null,
  });
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    const result = await readSession();
    if (request === sequence.current) setState({ ...result, loading: false });
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const request = ++sequence.current;
    readSession(controller.signal).then((result) => {
      if (!controller.signal.aborted && request === sequence.current)
        setState({ ...result, loading: false });
    });
    return () => controller.abort();
  }, []);
  return (
    <SessionContext.Provider value={{ ...state, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession requires SessionProvider');
  return context;
}
