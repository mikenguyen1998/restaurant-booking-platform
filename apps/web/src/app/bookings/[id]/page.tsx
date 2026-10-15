import { EmptyState } from '@/components/shared/ui';
export default function Page() {
  return (
    <div className="container section">
      <EmptyState
        title="Thông tin đặt chỗ đang được hoàn thiện"
        description="Chưa thể tra cứu hay thay đổi đặt chỗ từ trang này."
        href="/dashboard/bookings"
        action="Đặt chỗ của tôi"
      />
    </div>
  );
}
