'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/providers/session-provider';

export const workspaceLinks = {
  customer: [
    ['/dashboard', 'Tổng quan'],
    ['/dashboard/bookings', 'Đặt chỗ của tôi'],
    ['/dashboard/favorites', 'Nhà hàng yêu thích'],
    ['/dashboard/collections', 'Bộ sưu tập'],
    ['/dashboard/notifications', 'Thông báo'],
    ['/dashboard/settings', 'Tài khoản & bảo mật'],
  ],
  owner: [
    ['/owner', 'Tổng quan'],
    ['/owner/restaurants', 'Nhà hàng của tôi'],
    ['/owner/bookings', 'Lịch đặt chỗ'],
    ['/owner/resources', 'Bàn & phòng riêng'],
    ['/owner/closures', 'Lịch tạm ngưng'],
    ['/owner/reviews', 'Đánh giá'],
  ],
  admin: [
    ['/admin', 'Tổng quan'],
    ['/admin/restaurants', 'Duyệt nhà hàng'],
    ['/admin/bookings', 'Quản lý đặt chỗ'],
    ['/admin/users', 'Người dùng'],
    ['/admin/reviews', 'Kiểm duyệt đánh giá'],
    ['/admin/audit', 'Nhật ký hoạt động'],
  ],
} as const;
export function WorkspaceShell({
  kind,
  children,
}: {
  kind: keyof typeof workspaceLinks;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const { account } = useSession();
  const title = {
    customer: 'Không gian của bạn',
    owner: 'Không gian nhà hàng',
    admin: 'Quản trị nền tảng',
  }[kind];
  return (
    <div className="container workspace">
      <aside className="workspace-sidebar">
        <p className="eyebrow">{title}</p>
        <nav aria-label={title}>
          {workspaceLinks[kind].map(([href, label], i) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? 'page' : undefined}
            >
              <span className="nav-symbol" aria-hidden="true">
                {['◫', '▤', '◇', '▦', '◷', '⚙'][i]}
              </span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="avatar">
            {account?.name.slice(0, 1).toUpperCase() ?? 'b'}
          </span>
          <div>
            <strong>{account?.name ?? 'Chào bạn'}</strong>
            <p>{account?.email ?? 'Đăng nhập để kết nối tài khoản'}</p>
          </div>
        </div>
        <Link className="text-link" href="/restaurants">
          ← Trở lại khám phá
        </Link>
      </aside>
      <div className="workspace-content">{children}</div>
    </div>
  );
}
