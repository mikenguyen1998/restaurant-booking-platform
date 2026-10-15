import { EmptyState } from '@/components/shared/ui';
export default function Page() {
  return (
    <div className="container section">
      <EmptyState
        title="Một bộ sưu tập đang thành hình"
        description="Tính năng xem bộ sưu tập sẽ được bổ sung sau. Không có dữ liệu riêng tư nào được hiển thị tại đây."
        href="/restaurants"
      />
    </div>
  );
}
