import { EmptyState } from '@/components/shared/ui';
export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState
        title="Có lẽ bạn đã rẽ nhầm một chút."
        description="Trang này không tồn tại. Vẫn còn nhiều nơi ngon đang chờ bạn."
        href="/"
        action="Trở về trang chủ"
        symbol="404"
      />
    </div>
  );
}
