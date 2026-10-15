import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Lịch đặt chỗ"
      description="Theo dõi cuộc hẹn, ghi nhận khách đến và liên hệ khi cần."
      columns={['Khách', 'Nhà hàng', 'Giờ đến', 'Số khách', 'Trạng thái']}
      action="Thêm đặt chỗ thủ công"
    />
  );
}
