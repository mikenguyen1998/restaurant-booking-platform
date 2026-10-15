import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Những điều mới dành cho bạn"
      description="Cập nhật về cuộc hẹn và nhà hàng của bạn."
      columns={['Nội dung', 'Thời gian', 'Trạng thái']}
    />
  );
}
