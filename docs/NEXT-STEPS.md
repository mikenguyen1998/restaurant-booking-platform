# Các bước tiếp theo

Đối chiếu tài liệu và code ngày 2026-10-14. Đây là kế hoạch thực hiện,
không phải xác nhận các quyết định nghiệp vụ còn mở.

## Mục tiêu

Nền tảng tìm nhà hàng và đặt chỗ, bắt đầu tại Hà Nội; phục vụ customer,
guest, restaurant owner và admin. Hướng tới UI Việt/Anh và mở rộng theo
timezone, currency, location của từng nhà hàng. API sở hữu nghiệp vụ;
PostgreSQL là nguồn dữ liệu chính. Điểm nhấn portfolio là booking transaction
không đặt trùng tài nguyên khi có nhiều yêu cầu đồng thời.

MVP cần hoàn thành luồng: tìm nhà hàng → xem availability → đặt chỗ →
xem/hủy/đổi lịch, cùng quản lý nhà hàng và duyệt của admin. Chưa có payment;
booking được phân bổ thành công vào `CONFIRMED` ngay trong transaction.

## Hiện trạng và khoảng cách

- Đã có monorepo, schema/migrations/seed, API nhà hàng public, session auth,
  email verification/reset, rate limiting và unit tests.
- Availability đã sinh slot, xử lý timezone/closures/buffer, chọn bàn và
  combinations, đọc cache và có hàm invalidation. Chưa nối invalidation vào
  các luồng ghi booking/cấu hình; chưa hoàn thành chính sách VIP.
- Booking module và phần lớn web vẫn là scaffold. Migration hiện chưa có
  exclusion constraint chống overlap; schema chưa có idempotency, booking
  events và transactional outbox như thiết kế đề xuất.
- CI hiện chạy typecheck/lint/build, chưa chạy tests. Một số test database
  được skip khi thiếu `TEST_DATABASE_URL`.
- README, docs API/database/architecture và phần trăm trong PROGRESS có nội
  dung cũ. `docs/database/proposed-*` là thiết kế đề xuất; schema và migrations
  trong `packages/database` mới phản ánh cấu trúc đang triển khai.

## Thứ tự thực hiện

1. **Chốt baseline trước booking.** Ghi quyết định cho closing/buffer (Q-08),
   giới hạn đặt chỗ (Q-11), combination capacity/ranking/VIP (Q-13–16), thông
   tin guest (Q-18), deadline và reschedule (Q-19–23, Q-35), snapshots (Q-40).
   Phân biệt quy tắc đã chốt với lựa chọn tạm trong code. Đồng bộ tài liệu API,
   schema và ADR; không áp SQL đề xuất trực tiếp vì tên bảng/cột khác schema thật.
2. **Hoàn thiện authorization và availability.** Role/policy checks phải kiểm
   tra cả ownership trong service. Áp verified-email cho luồng customer theo
   chính sách; giữ luồng guest riêng đúng quyền. Review tính nguyên tử của tăng
   cache version (`get` rồi `set` hiện tại), cache khi slot thành quá khứ và
   khi restaurant đổi trạng thái. Nối invalidation sau commit của booking và
   thay đổi resources/opening hours/closures/settings.
3. **Booking create + bảo đảm ở database.** Thêm migration chống overlap trên
   `BookingResource` active với khoảng `[allocatedFromAt, allocatedUntilAt)`
   gồm buffer; khuyến nghị exclusion constraint theo T-01. Thêm idempotency
   key + request fingerprint, snapshots cần thiết, events/outbox. Trong cùng
   transaction: kiểm tra restaurant/slot, chọn và giữ tài nguyên, tạo booking
   `CONFIRMED`, ghi events. Availability cache chỉ là gợi ý; write path phải
   kiểm tra lại. Xử lý conflict/retry có giới hạn và không để lại bản ghi dở dang.
4. **Kiểm chứng concurrency trước mở rộng UI.** PostgreSQL test riêng: một bàn,
   N requests cùng giờ → một booking thành công; buffer sát biên, nhiều bàn
   all-or-nothing, cùng idempotency key, key khác payload → conflict. Thêm
   `pnpm test` vào CI và PostgreSQL service cho integration suites; không coi
   suite bị skip là đã kiểm chứng. Dùng Redis test riêng nếu suite cần Redis.
5. **Booking management.** My bookings, hủy theo deadline, reschedule atomic
   (thất bại giữ nguyên booking cũ), owner xử lý guest và no-show, admin xử lý
   hủy từ phía nhà hàng. Owner không có bước xác nhận booking online và không
   được trực tiếp hủy booking confirmed của customer.
6. **Owner/admin và web MVP.** Onboarding, resources/settings/closures, admin
   approve/reject/suspend. Web: API client/session/CSRF, discovery/detail,
   availability picker, booking confirmation, auth và My bookings; sau đó owner
   dashboard. Kiểm chứng toàn bộ luồng bằng dữ liệu seed.
7. **Worker và hoàn thiện sản phẩm.** Outbox processing, completion/no-show,
   email/in-app reminders; reviews sau `COMPLETED`, favorites/collections.
   Elasticsearch/maps theo mục tiêu discovery; triển khai demo và tài liệu
   chống double booking. AI là stretch sau core booking, không thuộc MVP.

## Review và viết test

Repo đã có Claude Code skill tại
[review-and-test](../.claude/skills/review-and-test/SKILL.md).
Trong Claude Code mở tại repo root, dùng `/review-and-test` sau mỗi thay đổi
nhỏ trong `apps/` hoặc `packages/`.

Workflow: đọc diff staged/unstaged và file mới → typecheck/lint/test → review
theo domain → nếu không có lỗi blocking, viết tests → chạy lại checks.
Workflow giữ nguyên feature code để người học tự sửa, không tự commit.
Nếu test mới phát hiện bug, giữ regression test và báo lỗi để sửa.

Đây là skill của Claude Code, không phải shell script hay `pnpm` command.
Trong môi trường agent khác, yêu cầu đọc file skill trên và thực hiện workflow;
không mặc định giao diện đó có cùng slash command.

Task tiếp theo nên nhỏ: **roles/policies + kiểm tra ownership**, chạy
`/review-and-test`, rồi chuẩn bị migration chống overlap và idempotency.
