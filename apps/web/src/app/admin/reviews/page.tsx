import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Kiểm duyệt đánh giá"
      description="Xem xét các đánh giá bị gắn cờ hoặc cần kiểm tra lại."
      columns={['Đánh giá', 'Nhà hàng', 'Lý do', 'Trạng thái']}
    />
  );
}
