import { PageHeading, PendingNotice } from '@/components/shared/ui';
export function RestaurantSettingsForm({
  existing = false,
}: {
  existing?: boolean;
}) {
  return (
    <>
      <PageHeading
        eyebrow="Nhà hàng của bạn"
        title={
          existing ? 'Cấu hình nhà hàng' : 'Một không gian, một câu chuyện.'
        }
        description="Chuẩn bị thông tin nhà hàng của bạn. Tính năng lưu và gửi duyệt đang được hoàn thiện."
      />
      <PendingNotice />
      <form className="settings-form">
        <section className="panel">
          <p className="eyebrow">01 · Thông tin nhà hàng</p>
          <h2>Giới thiệu một nơi để hẹn</h2>
          <div className="form-grid">
            <label>
              Tên nhà hàng
              <input placeholder="Tên không gian của bạn" />
            </label>
            <label>
              Khu vực
              <input placeholder="Quận / huyện tại Hà Nội" />
            </label>
            <label className="span-full">
              Địa chỉ
              <input placeholder="Địa chỉ đầy đủ" />
            </label>
            <label className="span-full">
              Giới thiệu
              <textarea
                rows={4}
                placeholder="Điều gì làm nhà hàng của bạn đặc biệt?"
              />
            </label>
          </div>
        </section>
        <section className="panel">
          <p className="eyebrow">02 · Thời gian & đặt chỗ</p>
          <h2>Dành chỗ cho những cuộc hẹn</h2>
          <div className="form-grid">
            <label>
              Giờ mở cửa
              <input type="time" />
            </label>
            <label>
              Giờ đóng cửa
              <input type="time" />
            </label>
            <label>
              Giờ nhận bàn cuối
              <input type="time" />
              <span className="field-hint">
                Độc lập với giờ đóng cửa; nhận khách đúng giờ này vẫn được phép.
              </span>
            </label>
            <label>
              Thời lượng bữa ăn (phút)
              <input type="number" defaultValue={120} />
            </label>
            <label>
              Khoảng cách giữa các giờ (phút)
              <input type="number" defaultValue={30} />
            </label>
            <label>
              Thời gian dọn bàn (phút)
              <input type="number" defaultValue={15} />
            </label>
            <label>
              Đặt trước tối thiểu (phút)
              <input type="number" min={30} defaultValue={120} />
            </label>
            <label>
              Nhận đặt trước (ngày)
              <input type="number" defaultValue={30} />
            </label>
            <label>
              Hạn tự hủy / đổi lịch trước giờ đến (phút)
              <input type="number" defaultValue={120} />
            </label>
            <label>
              Phòng riêng khi không được yêu cầu
              <select defaultValue="">
                <option value="" disabled>
                  Chọn chính sách phòng riêng
                </option>
                <option value="ONLY_WHEN_REQUESTED">
                  Chỉ khi khách yêu cầu
                </option>
                <option value="ALLOW_AS_FALLBACK">
                  Cho phép làm phương án thay thế
                </option>
              </select>
            </label>
          </div>
        </section>
        <div className="form-actions">
          <p className="small-text">
            Hồ sơ cần được admin duyệt trước khi nhà hàng được nhận đặt chỗ.
          </p>
          <button type="button" className="button" disabled>
            Lưu hồ sơ · sắp ra mắt
          </button>
        </div>
      </form>
    </>
  );
}
