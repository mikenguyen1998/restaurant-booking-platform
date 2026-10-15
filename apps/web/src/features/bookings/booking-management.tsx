'use client';
import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  bookingStatuses,
  type BookingListResponse,
  type BookingListQuery,
  type BookingView,
  type ManualBookingRequest,
} from '@restaurant-platform/shared';
import { bookingApi } from '@/lib/booking-api';
import { errorMessage } from '@/lib/api';
import { PageHeading, PendingNotice } from '@/components/shared/ui';
type Scope = 'customer' | 'owner' | 'admin';
type Action =
  | 'detail'
  | 'cancel'
  | 'reschedule'
  | 'manual'
  | 'arrival'
  | 'contact'
  | 'hold'
  | 'noShow'
  | 'correct';
const labels: Record<Action, string> = {
  detail: 'Tra cứu',
  cancel: 'Hủy theo yêu cầu',
  reschedule: 'Đổi lịch / số khách',
  manual: 'Tạo booking thủ công',
  arrival: 'Ghi nhận đã đến',
  contact: 'Ghi nhận liên hệ',
  hold: 'Gia hạn chờ',
  noShow: 'Đánh dấu không đến',
  correct: 'Sửa kết quả',
};
export function BookingManagement({
  scope,
  initialId = '',
}: {
  scope: Scope;
  initialId?: string;
}) {
  const [action, setAction] = useState<Action>('detail');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingView | null>(null);
  const [list, setList] = useState<BookingListResponse | null>(null);
  const intent = useRef<{ fingerprint: string; key: string } | null>(null);
  const actions: Action[] =
    scope === 'owner'
      ? [
          'detail',
          'manual',
          'arrival',
          'contact',
          'hold',
          'noShow',
          'cancel',
          'reschedule',
          'correct',
        ]
      : ['detail', 'cancel', 'reschedule'];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? '');
    const restaurant = text('restaurantId');
    const id = text('bookingId');
    setBusy(true);
    setError(null);
    setBooking(null);
    setList(null);
    try {
      if (text('intent') === 'list') {
        const status = text('status');
        const query: BookingListQuery = {
          page: Number(text('page')),
          limit: Number(text('limit')),
          ...(bookingStatuses.includes(
            status as BookingListQuery['status'] & string,
          )
            ? { status: status as BookingListQuery['status'] }
            : {}),
          ...(text('from') ? { from: text('from') } : {}),
          ...(text('to') ? { to: text('to') } : {}),
        };
        setList(
          await (scope === 'owner'
            ? bookingApi.ownerList(restaurant, query)
            : scope === 'admin'
              ? bookingApi.adminList({
                  ...query,
                  ...(restaurant ? { restaurantId: restaurant } : {}),
                })
              : bookingApi.listMine(query)),
        );
        return;
      }
      const reason = text('reason');
      const contactEvidence = text('contactEvidence');
      const time = {
        date: text('date'),
        slot: text('slot'),
        partySize: Number(text('partySize')),
        reason,
      };
      let result: BookingView;
      if (action === 'detail')
        result = await (scope === 'owner'
          ? bookingApi.ownerDetail(restaurant, id)
          : scope === 'admin'
            ? bookingApi.adminDetail(id)
            : bookingApi.detail(id));
      else if (action === 'cancel')
        result = await (scope === 'owner'
          ? bookingApi.ownerCancel(restaurant, id, { reason, contactEvidence })
          : scope === 'admin'
            ? bookingApi.adminCancel(id, { reason })
            : bookingApi.cancel(id, { reason }));
      else if (action === 'reschedule')
        result = await (scope === 'owner'
          ? bookingApi.ownerReschedule(restaurant, id, {
              ...time,
              contactEvidence,
            })
          : scope === 'admin'
            ? bookingApi.adminReschedule(id, time)
            : bookingApi.reschedule(id, time));
      else if (action === 'manual') {
        const preference = text('preferredResourceType');
        const input: ManualBookingRequest = {
          date: time.date,
          slot: time.slot,
          partySize: time.partySize,
          reason,
          contact: {
            name: text('name'),
            phone: text('phone'),
            ...(text('email') ? { email: text('email') } : {}),
          },
          ...(preference === 'TABLE' || preference === 'VIP_ROOM'
            ? { preferredResourceType: preference }
            : {}),
          ...(text('specialRequest')
            ? { specialRequest: text('specialRequest') }
            : {}),
        };
        const fingerprint = JSON.stringify({ restaurant, input });
        if (intent.current?.fingerprint !== fingerprint)
          intent.current = { fingerprint, key: crypto.randomUUID() };
        result = await bookingApi.manual(restaurant, input, intent.current.key);
      } else if (action === 'arrival')
        result = await bookingApi.arrival(restaurant, id);
      else if (action === 'contact')
        result = await bookingApi.contact(restaurant, id, {
          outcome: text('outcome') === 'REACHED' ? 'REACHED' : 'UNREACHABLE',
          note: text('note'),
        });
      else if (action === 'hold')
        result = await bookingApi.hold(restaurant, id, {
          holdUntil: new Date(text('holdUntil')).toISOString(),
          reason,
        });
      else if (action === 'noShow')
        result = await bookingApi.noShow(restaurant, id, {
          reason,
          contactEvidence,
        });
      else
        result = await bookingApi.correct(restaurant, id, {
          status:
            text('targetStatus') === 'COMPLETED' ? 'COMPLETED' : 'NO_SHOW',
          reason,
        });
      setBooking(result);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const timeRequired = ['manual', 'reschedule'].includes(action);
  const reasonRequired =
    action === 'manual' ||
    action === 'hold' ||
    action === 'noShow' ||
    action === 'correct' ||
    (scope !== 'customer' && ['cancel', 'reschedule'].includes(action));
  return (
    <div className="container section">
      <PageHeading
        eyebrow={scope}
        title="Quản lý đặt chỗ"
        description="Forms gọi API thật. Nghiệp vụ chưa triển khai trả 501; quyền được kiểm tra tại máy chủ khi triển khai service."
      />
      <PendingNotice />
      <form className="panel" onSubmit={submit}>
        <input type="hidden" name="intent" value="list" />
        <h2>Danh sách</h2>
        <div className="form-grid">
          {scope !== 'customer' && (
            <label>
              Restaurant ID{scope === 'admin' ? ' (tùy chọn)' : ''}
              <input name="restaurantId" required={scope === 'owner'} />
            </label>
          )}
          <label>
            Trang
            <input
              name="page"
              type="number"
              min={1}
              defaultValue={1}
              required
            />
          </label>
          <label>
            Số dòng
            <input
              name="limit"
              type="number"
              min={1}
              defaultValue={20}
              required
            />
          </label>
          <label>
            Trạng thái
            <select name="status">
              <option value="">Tất cả</option>
              {bookingStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Từ ngày
            <input name="from" type="date" />
          </label>
          <label>
            Đến ngày
            <input name="to" type="date" />
          </label>
        </div>
        <button className="button" disabled={busy}>
          Tải danh sách
        </button>
      </form>
      <form className="panel" onSubmit={submit}>
        <h2>Chi tiết / thao tác</h2>
        <div className="form-grid">
          <label>
            Thao tác
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as Action)}
            >
              {actions.map((a) => (
                <option key={a} value={a}>
                  {labels[a]}
                </option>
              ))}
            </select>
          </label>
          {scope === 'owner' && (
            <label>
              Restaurant ID
              <input name="restaurantId" required />
            </label>
          )}
          {action !== 'manual' && (
            <label>
              Booking ID
              <input name="bookingId" defaultValue={initialId} required />
            </label>
          )}
          {timeRequired && (
            <>
              <label>
                Ngày
                <input name="date" type="date" required />
              </label>
              <label>
                Giờ
                <input name="slot" type="time" required />
              </label>
              <label>
                Số khách
                <input name="partySize" type="number" min={1} required />
              </label>
            </>
          )}
          {action === 'manual' && (
            <>
              <label>
                Tên khách
                <input name="name" required />
              </label>
              <label>
                Điện thoại
                <input name="phone" type="tel" required />
              </label>
              <label>
                Email
                <input name="email" type="email" />
              </label>
              <label>
                Ưu tiên
                <select name="preferredResourceType">
                  <option value="">Không yêu cầu</option>
                  <option value="TABLE">Bàn</option>
                  <option value="VIP_ROOM">VIP</option>
                </select>
              </label>
              <label>
                Lời nhắn
                <textarea name="specialRequest" />
              </label>
            </>
          )}
          {action !== 'detail' &&
            action !== 'arrival' &&
            action !== 'contact' && (
              <label>
                Lý do
                <textarea name="reason" required={reasonRequired} />
              </label>
            )}
          {scope === 'owner' &&
            ['cancel', 'reschedule', 'noShow'].includes(action) && (
              <label>
                Bằng chứng yêu cầu / liên hệ
                <textarea name="contactEvidence" required />
              </label>
            )}
          {action === 'contact' && (
            <>
              <label>
                Kết quả
                <select name="outcome">
                  <option value="REACHED">Liên hệ được</option>
                  <option value="UNREACHABLE">Không liên hệ được</option>
                </select>
              </label>
              <label>
                Ghi chú liên hệ
                <textarea name="note" required />
              </label>
            </>
          )}
          {action === 'hold' && (
            <label>
              Chờ đến (giờ địa phương của trình duyệt)
              <input name="holdUntil" type="datetime-local" required />
            </label>
          )}
          {action === 'correct' && (
            <label>
              Kết quả sửa
              <select name="targetStatus">
                <option>COMPLETED</option>
                <option>NO_SHOW</option>
              </select>
            </label>
          )}
        </div>
        <button className="button" disabled={busy}>
          {busy ? 'Đang gửi…' : 'Gửi tới API'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {booking && (
        <section className="panel" role="status">
          <h2>{booking.reference}</h2>
          <p>
            {booking.status} · {booking.partySize} khách · {booking.startsAt}
          </p>
        </section>
      )}
      {list && (
        <section className="panel">
          <h2>Kết quả từ API</h2>
          {list.data.length === 0 ? (
            <p>Không có booking.</p>
          ) : (
            list.data.map((item) => (
              <p key={item.id}>
                {scope === 'customer' ? (
                  <Link href={`/bookings/${item.id}`}>{item.reference}</Link>
                ) : (
                  <span>
                    {item.reference} · {item.id}
                  </span>
                )}{' '}
                · {item.status} · {item.startsAt}
              </p>
            ))
          )}
          <p>
            Trang {list.meta.currentPage}/{list.meta.totalPages} ·{' '}
            {list.meta.totalItems} booking
          </p>
        </section>
      )}
    </div>
  );
}
