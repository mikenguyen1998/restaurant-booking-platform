import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Quản lý đặt chỗ"
      description="Hỗ trợ thay đổi quan trọng với lý do và lịch sử rõ ràng."
      columns={['Mã đặt chỗ', 'Nhà hàng', 'Khách', 'Thời gian', 'Trạng thái']}
    />
  );
}
