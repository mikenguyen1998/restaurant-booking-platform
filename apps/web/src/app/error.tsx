'use client';

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="container section">
      <div className="empty-state">
        <span className="empty-symbol" aria-hidden="true">
          ◌
        </span>
        <h1>Chưa thể mở trang này.</h1>
        <p>Đã có lỗi khi tải nội dung. Bạn có thể thử lại trong giây lát.</p>
        <button type="button" className="button" onClick={retry}>
          Thử lại
        </button>
      </div>
    </div>
  );
}
