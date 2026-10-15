import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Duyệt nhà hàng"
      description="Kiểm tra hồ sơ và quản lý trạng thái nhà hàng."
      columns={['Nhà hàng', 'Chủ nhà hàng', 'Gửi lúc', 'Trạng thái']}
    />
  );
}
