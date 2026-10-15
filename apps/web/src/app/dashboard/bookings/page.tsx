import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Đặt chỗ của tôi"
      description="Những cuộc hẹn sắp tới và bữa ăn đã qua."
      columns={['Nhà hàng', 'Thời gian', 'Số khách', 'Trạng thái']}
    />
  );
}
