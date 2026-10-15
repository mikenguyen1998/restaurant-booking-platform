import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Bộ sưu tập của bạn"
      description="Gom những địa chỉ ngon theo cách của bạn."
      columns={['Bộ sưu tập', 'Quyền riêng tư', 'Nhà hàng']}
      action="Tạo bộ sưu tập"
    />
  );
}
