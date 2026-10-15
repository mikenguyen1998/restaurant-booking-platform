import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Những nơi bạn yêu thích"
      description="Lưu một nơi vừa ý cho cuộc hẹn tiếp theo."
      columns={['Nhà hàng', 'Khu vực', 'Ngày lưu']}
    />
  );
}
