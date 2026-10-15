import Link from 'next/link';

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
export function StatusPill({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span className={`status-pill${muted ? ' muted' : ''}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted-text">{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  href,
  action = 'Khám phá nhà hàng',
  symbol = '◇',
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
  symbol?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-symbol" aria-hidden="true">
        {symbol}
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {href && (
        <Link className="button secondary" href={href}>
          {action} <Arrow />
        </Link>
      )}
    </div>
  );
}
export function LoadingCards() {
  return (
    <div
      className="restaurant-grid"
      role="status"
      aria-label="Đang tải nhà hàng"
    >
      {[0, 1, 2].map((n) => (
        <div className="restaurant-card skeleton-card" key={n}>
          <div className="skeleton skeleton-cover" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
export function PendingNotice() {
  return (
    <div className="notice">
      <span aria-hidden="true">◌</span>
      <p>
        Không gian này đang được hoàn thiện. Các thao tác lưu và đặt chỗ chưa
        khả dụng.
      </p>
    </div>
  );
}
