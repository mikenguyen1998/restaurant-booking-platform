import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Nhà hàng của tôi"
      description="Một tài khoản có thể quản lý nhiều nhà hàng."
      columns={['Nhà hàng', 'Khu vực', 'Trạng thái']}
      action="Thêm nhà hàng"
      actionHref="/owner/restaurants/new"
    />
  );
}
