import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Bàn & phòng riêng"
      description="Chuẩn bị tài nguyên, sức chứa và những tổ hợp được phép."
      columns={['Tài nguyên', 'Nhà hàng', 'Loại', 'Sức chứa', 'Trạng thái']}
      action="Thêm tài nguyên"
    />
  );
}
