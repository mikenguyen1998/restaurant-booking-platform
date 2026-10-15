'use client';
import { useState } from 'react';
import type { SessionView } from '@restaurant-platform/shared';
import { apiRequest, errorMessage } from '@/lib/api';
import { useResource } from '@/lib/use-resource';
import { useSession } from '@/providers/session-provider';
import { EmptyState, PageHeading, StatusPill } from '@/components/shared/ui';

export function SessionSettings() {
  const { account, loading, error: connectionError, refresh } = useSession();
  const sessions = useResource<SessionView[]>(
    account ? '/auth/sessions' : null,
  );
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function act(path: string, method: string, message: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await apiRequest(path, { method });
      setNotice(message);
      sessions.reload();
      await refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="Không gian của bạn"
        title="Tài khoản & bảo mật"
        description="Thông tin của bạn và những nơi đang đăng nhập."
      />
      {loading ? (
        <p role="status">Đang kết nối tài khoản…</p>
      ) : !account ? (
        <EmptyState
          title="Kết nối tài khoản của bạn"
          description={
            connectionError ??
            'Đăng nhập để xem thông tin và quản lý phiên đăng nhập.'
          }
          href="/sign-in"
          action="Đăng nhập"
        />
      ) : (
        <>
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>{account.name}</h2>
                <p className="muted-text">{account.email}</p>
              </div>
              <StatusPill muted={!account.emailVerified}>
                {account.emailVerified
                  ? 'Email đã xác minh'
                  : 'Chưa xác minh email'}
              </StatusPill>
            </div>
            {!account.emailVerified && (
              <button
                className="button secondary"
                disabled={busy}
                onClick={() =>
                  act(
                    '/auth/email/verification',
                    'POST',
                    'Yêu cầu gửi liên kết xác minh đã được tiếp nhận.',
                  )
                }
              >
                Gửi lại email xác minh
              </button>
            )}
            <p className="small-text">
              Bạn có thể quản lý các thiết bị bên dưới. Chỉnh sửa hồ sơ sẽ được
              bổ sung sau.
            </p>
          </section>
          <section className="panel">
            <h2>Phiên đăng nhập</h2>
            {sessions.loading ? (
              <p role="status">Đang tải phiên đăng nhập…</p>
            ) : sessions.error ? (
              <p className="form-error" role="alert">
                {errorMessage(sessions.error)}
              </p>
            ) : (
              sessions.data?.map((session) => (
                <div className="session-row" key={session.id}>
                  <div>
                    <strong>
                      {session.userAgent ?? 'Thiết bị chưa xác định'}
                    </strong>
                    <p>
                      {session.current
                        ? 'Phiên hiện tại'
                        : 'Phiên đăng nhập khác'}
                    </p>
                  </div>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() =>
                      act(
                        `/auth/sessions/${encodeURIComponent(session.id)}`,
                        'DELETE',
                        'Phiên đăng nhập đã được kết thúc.',
                      )
                    }
                  >
                    Đăng xuất
                  </button>
                </div>
              ))
            )}
            <button
              className="button secondary"
              disabled={busy}
              onClick={() =>
                act(
                  '/auth/sign-out-everywhere',
                  'POST',
                  'Đã đăng xuất trên mọi thiết bị.',
                )
              }
            >
              Đăng xuất mọi thiết bị
            </button>
          </section>
        </>
      )}
      {notice && (
        <p className="form-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
