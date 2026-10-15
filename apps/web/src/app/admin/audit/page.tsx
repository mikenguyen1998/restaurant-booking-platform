import { PendingWorkspace } from '@/features/dashboard/pending-workspace';
export default function Page() {
  return (
    <PendingWorkspace
      title="Nhật ký hoạt động"
      description="Theo dõi tác nhân, thời gian và lý do của những thay đổi."
      columns={['Thời gian', 'Tác nhân', 'Hành động', 'Đối tượng']}
    />
  );
}
