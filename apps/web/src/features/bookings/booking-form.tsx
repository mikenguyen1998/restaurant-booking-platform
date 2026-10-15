'use client';
import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import type {
  CreateBookingRequest,
  BookingReceipt,
} from '@restaurant-platform/shared';
import { PageHeading, PendingNotice } from '@/components/shared/ui';
import { bookingApi } from '@/lib/booking-api';
import { errorMessage } from '@/lib/api';
import { useSession } from '@/providers/session-provider';
export function BookingForm({
  restaurantId,
  date,
  slot,
  partySize,
}: {
  restaurantId?: string;
  date?: string;
  slot?: string;
  partySize?: string;
}) {
  const { account, loading, error: sessionError } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const intent = useRef<{ fingerprint: string; key: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? '');
    const preference = text('preferredResourceType');
    const input: CreateBookingRequest = {
      restaurantId: text('restaurantId'),
      date: text('date'),
      slot: text('slot'),
      partySize: Number(text('partySize')),
      ...(preference === 'TABLE' || preference === 'VIP_ROOM'
        ? { preferredResourceType: preference }
        : {}),
      ...(text('name') || text('phone')
        ? {
            contact: {
              name: text('name'),
              phone: text('phone'),
              ...(text('email') ? { email: text('email') } : {}),
            },
          }
        : {}),
      ...(text('specialRequest')
        ? { specialRequest: text('specialRequest') }
        : {}),
    };
    const fingerprint = JSON.stringify({ account: account?.id ?? null, input });
    if (intent.current?.fingerprint !== fingerprint)
      intent.current = { fingerprint, key: crypto.randomUUID() };
    setBusy(true);
    setError(null);
    setReceipt(null);
    try {
      setReceipt(await bookingApi.create(input, intent.current.key));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container section narrow-page">
      <Link className="breadcrumb" href="/restaurants">
        ← Trở lại khám phá
      </Link>
      <PageHeading
        eyebrow="Một cuộc hẹn đang chờ"
        title="Dành một bàn cho nhau."
        description="Chỗ trống chỉ để tham khảo. Chỉ xác nhận khi máy chủ trả về booking hợp lệ."
      />
      <PendingNotice />
      <form className="panel" onSubmit={submit}>
        <h2>Thông tin cuộc hẹn</h2>
        <div className="form-grid">
          <label className="span-full">
            Restaurant ID
            <input name="restaurantId" required defaultValue={restaurantId} />
          </label>
          <label>
            Ngày đến
            <input name="date" type="date" required defaultValue={date} />
          </label>
          <label>
            Giờ đến
            <input name="slot" type="time" required defaultValue={slot} />
          </label>
          <label>
            Số khách
            <input
              name="partySize"
              type="number"
              min={1}
              required
              defaultValue={partySize ?? '2'}
            />
          </label>
          <label>
            Không gian ưu tiên
            <select name="preferredResourceType">
              <option value="">Không có yêu cầu riêng</option>
              <option value="TABLE">Bàn</option>
              <option value="VIP_ROOM">Phòng VIP</option>
            </select>
          </label>
          <label>
            Tên liên hệ
            <input name="name" autoComplete="name" required={!account} />
          </label>
          <label>
            Số điện thoại
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required={!account}
            />
          </label>
          <label>
            Email (khách vãng lai không bắt buộc)
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label className="span-full">
            Lời nhắn
            <textarea name="specialRequest" rows={3} />
          </label>
        </div>
        <p className="small-text">
          Tài khoản cần xác minh email trước khi đặt. Phí VIP phải được máy chủ
          báo rõ và snapshot trước khi xác nhận; thanh toán tại nhà hàng. Luồng
          báo giá chưa triển khai.
        </p>
        {sessionError && <p role="alert">{sessionError}</p>}
        {error && <p role="alert">{error}</p>}
        {receipt && (
          <p role="status">
            Máy chủ trả về mã {receipt.reference} · trạng thái {receipt.status}.
          </p>
        )}
        <button
          className="button"
          disabled={busy || loading || Boolean(sessionError)}
        >
          {busy ? 'Đang gửi…' : 'Gửi yêu cầu · API đang hoàn thiện'}
        </button>
      </form>
    </div>
  );
}
