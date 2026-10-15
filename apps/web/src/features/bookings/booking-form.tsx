import Link from 'next/link';
import { PageHeading, PendingNotice } from '@/components/shared/ui';
export function BookingForm({
  date,
  slot,
  partySize,
}: {
  date?: string;
  slot?: string;
  partySize?: string;
}) {
  return (
    <div className="container section narrow-page">
      <Link className="breadcrumb" href="/restaurants">
        ← Trở lại khám phá
      </Link>
      <PageHeading
        eyebrow="Một cuộc hẹn đang chờ"
        title="Dành một bàn cho nhau."
        description="Chuẩn bị thông tin của bạn. Chưa có bàn nào được giữ hoặc xác nhận từ trang này."
      />
      <PendingNotice />
      <div className="booking-layout">
        <form className="panel">
          <h2>Thông tin cuộc hẹn</h2>
          <div className="form-grid">
            <label>
              Ngày đến
              <input type="date" defaultValue={date} />
            </label>
            <label>
              Giờ đến
              <input type="time" defaultValue={slot} />
            </label>
            <label>
              Số khách
              <input type="number" min={1} defaultValue={partySize ?? '2'} />
            </label>
            <label>
              Không gian ưu tiên
              <select defaultValue="">
                <option value="">Không có yêu cầu riêng</option>
                <option value="VIP_ROOM">Phòng riêng / VIP</option>
              </select>
            </label>
            <label className="span-full">
              Tên liên hệ
              <input autoComplete="name" placeholder="Tên khách đến nhà hàng" />
            </label>
            <label>
              Số điện thoại
              <input
                autoComplete="tel"
                type="tel"
                placeholder="Số điện thoại liên hệ"
              />
            </label>
            <label>
              Email (không bắt buộc với khách vãng lai)
              <input
                autoComplete="email"
                type="email"
                placeholder="Nhận xác nhận qua email"
              />
            </label>
            <label className="span-full">
              Lời nhắn cho nhà hàng
              <textarea
                rows={3}
                placeholder="Một dịp đặc biệt hoặc lưu ý của bạn…"
              />
            </label>
          </div>
          <button type="button" className="button full" disabled>
            Đặt bàn · sắp ra mắt
          </button>
        </form>
        <aside className="panel booking-summary">
          <p className="eyebrow">Trước cuộc hẹn</p>
          <h2>
            Đến đúng giờ.
            <br />
            Thưởng thức trọn vẹn.
          </h2>
          <ul>
            <li>Chỗ trống hiển thị chỉ để tham khảo, chưa giữ bàn.</li>
            <li>Tài khoản cần xác minh email trước khi đặt chỗ.</li>
            <li>
              Khách vãng lai cần tên và số điện thoại; email không bắt buộc.
            </li>
            <li>
              Phí phòng VIP, nếu có, phải được hiển thị trước khi đặt và thanh
              toán tại nhà hàng.
            </li>
          </ul>
          <Link className="text-link" href="/sign-in">
            Đăng nhập tài khoản →
          </Link>
        </aside>
      </div>
    </div>
  );
}
