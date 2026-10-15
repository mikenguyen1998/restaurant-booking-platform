'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '@/providers/session-provider';
import { apiRequest, errorMessage } from '@/lib/api';

export function SiteHeader() {
  const path = usePathname();
  const router = useRouter();
  const { account, refresh } = useSession();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    setError('');
    try {
      await apiRequest('/auth/sign-out', { method: 'POST' });
      await refresh();
      router.push('/');
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <a className="skip-link" href="#main-content">
        Đến nội dung
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="Bàn — trang chủ">
            <span className="brand-mark" aria-hidden="true">
              b.
            </span>
            <span>
              bàn<span className="brand-period">.</span>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Điều hướng chính">
            <Link
              href="/restaurants"
              aria-current={
                path.startsWith('/restaurants') ? 'page' : undefined
              }
            >
              Khám phá
            </Link>
            <Link
              href="/dashboard/bookings"
              aria-current={path.startsWith('/dashboard') ? 'page' : undefined}
            >
              Đặt chỗ của tôi
            </Link>
            <Link href="/owner">
              Dành cho nhà hàng <span aria-hidden="true">↗</span>
            </Link>
          </nav>
          <div className="header-actions">
            <span className="city-label">Hà Nội, Việt Nam</span>
            {account ? (
              <>
                <Link className="account-link" href="/dashboard">
                  <span className="avatar">
                    {account.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span>{account.name}</span>
                </Link>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={signOut}
                >
                  {busy ? 'Đang thoát…' : 'Đăng xuất'}
                </button>
              </>
            ) : (
              <Link className="button small" href="/sign-in">
                Đăng nhập <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </div>
      </header>
      {error && (
        <div className="container form-error" role="alert">
          {error}
        </div>
      )}
    </>
  );
}
