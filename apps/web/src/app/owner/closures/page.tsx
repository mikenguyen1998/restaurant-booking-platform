import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Lịch tạm ngưng"
      description="Quản lý khoảng tạm ngưng theo nhà hàng hoặc từng bàn, phòng."
      columns={['Phạm vi', 'Bắt đầu', 'Kết thúc', 'Lý do']}
      action="Thêm lịch tạm ngưng"
    />
  );
}
