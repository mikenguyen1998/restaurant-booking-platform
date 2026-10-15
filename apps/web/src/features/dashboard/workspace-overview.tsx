import Link from 'next/link';
import { EmptyState, PageHeading, PendingNotice } from '@/components/shared/ui';
export function WorkspaceOverview({
  kind,
}: {
  kind: 'customer' | 'owner' | 'admin';
}) {
  const content = {
    customer: {
      eyebrow: 'Không gian của bạn',
      title: 'Dành thời gian cho nhau.',
      description:
        'Những nhà hàng yêu thích và cuộc hẹn sắp tới, cùng ở một nơi.',
      metrics: ['Cuộc hẹn sắp tới', 'Nhà hàng yêu thích', 'Bộ sưu tập của bạn'],
      section: 'Cuộc hẹn tiếp theo',
      action: '/restaurants',
      label: 'Khám phá nhà hàng',
    },
    owner: {
      eyebrow: 'Không gian nhà hàng',
      title: 'Sẵn sàng đón khách.',
      description:
        'Một góc nhìn cho nhà hàng, lịch đặt chỗ và sự chăm sóc từng bàn ăn.',
      metrics: ['Nhà hàng của bạn', 'Đặt chỗ hôm nay', 'Cần bạn xử lý'],
      section: 'Lịch đặt chỗ hôm nay',
      action: '/owner/restaurants/new',
      label: 'Chuẩn bị hồ sơ nhà hàng',
    },
    admin: {
      eyebrow: 'Quản trị nền tảng',
      title: 'Chăm chút trải nghiệm chung.',
      description:
        'Duyệt nhà hàng, hỗ trợ đặt chỗ và giữ chất lượng cộng đồng.',
      metrics: ['Nhà hàng chờ duyệt', 'Yêu cầu hỗ trợ', 'Đánh giá cần xem xét'],
      section: 'Hoạt động cần xử lý',
      action: '/admin/restaurants',
      label: 'Xem không gian duyệt',
    },
  }[kind];
  return (
    <>
      <PageHeading
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      >
        <Link className="button" href={content.action}>
          {content.label} ↗
        </Link>
      </PageHeading>
      <PendingNotice />
      <div className="metrics-grid">
        {content.metrics.map((label) => (
          <section className="metric" key={label}>
            <p>{label}</p>
            <strong aria-label="Chưa có dữ liệu">—</strong>
            <span>Chờ kết nối dữ liệu</span>
          </section>
        ))}
      </div>
      <section className="panel">
        <div className="section-heading">
          <h2>{content.section}</h2>
          <span className="small-text">Tất cả sẽ bắt đầu từ đây</span>
        </div>
        <EmptyState
          title="Một không gian đang thành hình"
          description="Thông tin sẽ xuất hiện khi tính năng tương ứng được hoàn thiện. Hiện chưa có dữ liệu hoạt động để hiển thị."
        />
      </section>
      <div className="workspace-tip">
        <span aria-hidden="true">✳</span>
        <p>
          {kind === 'customer'
            ? 'Tìm một nhà hàng hợp ý trước, rồi chọn thời gian để kiểm tra chỗ trống.'
            : kind === 'owner'
              ? 'Tài khoản chủ nhà hàng vẫn có thể khám phá, yêu thích và đặt chỗ với tư cách thực khách.'
              : 'Các thao tác quản trị sẽ yêu cầu kiểm tra quyền và ghi nhận lịch sử trước khi được kích hoạt.'}
        </p>
      </div>
    </>
  );
}
