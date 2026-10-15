'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest, errorMessage } from '@/lib/api';
import { useSession } from '@/providers/session-provider';

export type AuthMode =
  'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password' | 'verify-email';
const content = {
  'sign-in': {
    title: 'Rất vui được gặp lại.',
    description: 'Đăng nhập để tìm những cuộc hẹn của bạn.',
    action: 'Đăng nhập',
    endpoint: '/auth/sign-in',
  },
  'sign-up': {
    title: 'Cùng nhau ăn ngon.',
    description: 'Tạo tài khoản và bắt đầu câu chuyện của bạn.',
    action: 'Tạo tài khoản',
    endpoint: '/auth/sign-up',
  },
  'forgot-password': {
    title: 'Tìm lại lối vào.',
    description: 'Nhập email để nhận hướng dẫn đặt lại mật khẩu.',
    action: 'Gửi hướng dẫn',
    endpoint: '/auth/password/forgot',
  },
  'reset-password': {
    title: 'Một khởi đầu mới.',
    description: 'Chọn mật khẩu mới để bảo vệ tài khoản.',
    action: 'Đặt lại mật khẩu',
    endpoint: '/auth/password/reset',
  },
  'verify-email': {
    title: 'Xác nhận email của bạn.',
    description: 'Xác minh địa chỉ email trước khi đặt chỗ bằng tài khoản.',
    action: 'Xác nhận email',
    endpoint: '/auth/email/verify',
  },
} as const;
export function AuthForm({
  mode,
  token = '',
}: {
  mode: AuthMode;
  token?: string;
}) {
  const copy = content[mode];
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { refresh } = useSession();
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setSuccess('');
    const fields = new FormData(event.currentTarget);
    const body: Record<string, string> = {};
    for (const key of ['name', 'email', 'password', 'token']) {
      const value = fields.get(key);
      if (typeof value === 'string') body[key] = value;
    }
    try {
      await apiRequest(copy.endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (mode === 'sign-in' || mode === 'sign-up') {
        await refresh();
        router.push('/dashboard');
      } else if (mode === 'forgot-password')
        setSuccess(
          'Nếu email này có tài khoản, hướng dẫn sẽ được gửi đến bạn.',
        );
      else if (mode === 'reset-password')
        setSuccess('Mật khẩu đã được cập nhật. Bạn có thể đăng nhập lại.');
      else {
        await refresh();
        setSuccess('Email đã được xác nhận.');
      }
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  const email = ['sign-in', 'sign-up', 'forgot-password'].includes(mode);
  const password = ['sign-in', 'sign-up', 'reset-password'].includes(mode);
  return (
    <div className="container auth-layout">
      <aside className="auth-story">
        <p className="eyebrow">Dành một chỗ cho nhau</p>
        <h2>
          Những cuộc hẹn ngon
          <br />
          bắt đầu từ <em>đây.</em>
        </h2>
        <div className="auth-orbit" aria-hidden="true">
          <span>bàn.</span>
        </div>
        <p>
          Một chiếc bàn, một nơi vừa ý,
          <br />
          và những người bạn muốn gặp.
        </p>
      </aside>
      <section className="auth-panel">
        <Link className="breadcrumb" href="/">
          ← Trở về trang chủ
        </Link>
        <p className="eyebrow">Chào bạn đến với Bàn</p>
        <h1>{copy.title}</h1>
        <p className="muted-text">{copy.description}</p>
        <form onSubmit={submit}>
          {mode === 'sign-up' && (
            <label>
              Tên của bạn
              <input
                name="name"
                autoComplete="name"
                maxLength={100}
                required
                placeholder="Bạn muốn được gọi là gì?"
              />
            </label>
          )}
          {email && (
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                placeholder="ban@example.com"
              />
            </label>
          )}
          {password && (
            <label>
              Mật khẩu
              <input
                name="password"
                type="password"
                autoComplete={
                  mode === 'sign-in' ? 'current-password' : 'new-password'
                }
                required
                minLength={mode === 'sign-in' ? 1 : 12}
                maxLength={mode === 'sign-in' ? undefined : 128}
                placeholder={
                  mode === 'sign-in' ? 'Mật khẩu của bạn' : 'Tối thiểu 12 ký tự'
                }
              />
            </label>
          )}
          {(mode === 'reset-password' || mode === 'verify-email') && (
            <label>
              Mã từ liên kết email
              <input
                name="token"
                defaultValue={token}
                required
                autoComplete="off"
                placeholder="Dán mã xác nhận trong liên kết"
              />
            </label>
          )}
          {mode === 'sign-in' && (
            <Link className="text-link form-end-link" href="/forgot-password">
              Quên mật khẩu?
            </Link>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="form-success" role="status">
              {success}
            </p>
          )}
          <button className="button full" disabled={pending} type="submit">
            {pending ? 'Đang xử lý…' : copy.action}{' '}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
        {mode === 'sign-in' && (
          <p className="auth-bottom">
            Chưa có tài khoản? <Link href="/sign-up">Tham gia cùng Bàn</Link>
          </p>
        )}
        {mode === 'sign-up' && (
          <p className="auth-bottom">
            Đã có tài khoản? <Link href="/sign-in">Đăng nhập</Link>
          </p>
        )}
        {!['sign-in', 'sign-up'].includes(mode) && (
          <Link className="text-link" href="/sign-in">
            Trở lại đăng nhập →
          </Link>
        )}
      </section>
    </div>
  );
}
