import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Lắng nghe thực khách"
      description="Đọc những chia sẻ và chuẩn bị phản hồi từ nhà hàng."
      columns={['Nhà hàng', 'Đánh giá', 'Nội dung', 'Phản hồi']}
    />
  );
}
