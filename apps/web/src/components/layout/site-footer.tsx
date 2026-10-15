import Link from 'next/link';
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Link href="/" className="brand">
            bàn.
          </Link>
          <p>Một bàn ăn. Nhiều câu chuyện.</p>
        </div>
        <nav aria-label="Điều hướng chân trang">
          <Link href="/restaurants">Khám phá Hà Nội</Link>
          <Link href="/owner">Không gian nhà hàng</Link>
          <Link href="/admin">Quản trị</Link>
        </nav>
        <span className="footer-note">Dành cho những cuộc hẹn đáng nhớ.</span>
      </div>
    </footer>
  );
}
