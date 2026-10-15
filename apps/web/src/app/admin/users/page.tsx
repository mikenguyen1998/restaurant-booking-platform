import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Người dùng"
      description="Không gian quản lý tài khoản và quyền truy cập."
      columns={['Tài khoản', 'Email', 'Vai trò', 'Trạng thái']}
    />
  );
}
