'use client';
import Link from 'next/link';
import { useState } from 'react';
import type {
  AvailabilitySlots,
  PageResult,
  RestaurantDetail as Detail,
  RestaurantReview,
} from '@restaurant-platform/shared';
import { useResource } from '@/lib/use-resource';
import { errorMessage } from '@/lib/api';
import { EmptyState, PageHeading, StatusPill } from '@/components/shared/ui';

function AvailabilityPicker({ restaurant }: { restaurant: Detail }) {
  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [query, setQuery] = useState<string | null>(null);
  const [selected, setSelected] = useState('');
  const { data, error, loading } = useResource<AvailabilitySlots>(query);
  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelected('');
    setQuery(
      `/restaurants/${restaurant.id}/availability?${new URLSearchParams({ date, partySize })}`,
    );
  }
  const booking = new URLSearchParams({
    restaurantId: restaurant.id,
    date,
    partySize,
    slot: selected,
  });
  return (
    <section className="availability-card" aria-label="Kiểm tra chỗ trống">
      <p className="eyebrow">Hẹn nhau một bữa ngon</p>
      <h2>Chọn thời gian của bạn</h2>
      <form onSubmit={search}>
        <label>
          Ngày đến
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Số khách
          <input
            type="number"
            min="1"
            required
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
          />
        </label>
        <button className="button full" disabled={loading} type="submit">
          {loading ? 'Đang tìm bàn…' : 'Xem giờ còn chỗ'}{' '}
          <span aria-hidden="true">↗</span>
        </button>
      </form>
      {error ? (
        <p className="form-error" role="alert">
          {errorMessage(error)}
        </p>
      ) : null}
      {data && (
        <div className="slot-results">
          <p className="small-text">Giờ tại nhà hàng · {restaurant.timezone}</p>
          <div className="slot-grid">
            {data.slots.map((slot) => (
              <button
                type="button"
                key={slot.time}
                className={`slot${selected === slot.time ? ' selected' : ''}`}
                disabled={!slot.available}
                aria-pressed={selected === slot.time}
                onClick={() => setSelected(slot.time)}
              >
                {slot.time}
              </button>
            ))}
          </div>
          {!data.slots.some((slot) => slot.available) && (
            <p>Chưa có giờ phù hợp trong ngày này. Hãy thử ngày khác.</p>
          )}
          {selected && (
            <Link className="button full" href={`/bookings/new?${booking}`}>
              Tiếp tục với {selected} <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      )}
      <p className="availability-note">
        Chỗ trống chỉ để tham khảo, chưa phải xác nhận giữ bàn. Tính năng hoàn
        tất đặt chỗ đang được hoàn thiện.
      </p>
    </section>
  );
}
export function RestaurantDetail({ id }: { id: string }) {
  const detail = useResource<Detail>(`/restaurants/${encodeURIComponent(id)}`);
  const reviews = useResource<PageResult<RestaurantReview>>(
    `/restaurants/${encodeURIComponent(id)}/reviews?limit=5`,
  );
  if (detail.loading)
    return (
      <div className="container section">
        <div
          className="skeleton detail-skeleton"
          role="status"
          aria-label="Đang tải thông tin nhà hàng"
        />
      </div>
    );
  if (detail.error || !detail.data)
    return (
      <div className="container section">
        <EmptyState
          title="Chưa thể mở thông tin nhà hàng"
          description={errorMessage(detail.error)}
          href="/restaurants"
        />
      </div>
    );
  const restaurant = detail.data;
  return (
    <div className="container section">
      <Link className="breadcrumb" href="/restaurants">
        ← Khám phá nhà hàng
      </Link>
      <PageHeading
        eyebrow={`${restaurant.district ?? restaurant.city} · ${'₫'.repeat(restaurant.priceLevel)}`}
        title={restaurant.name}
        description={restaurant.address}
      >
        <StatusPill>Nhà hàng trên Bàn</StatusPill>
      </PageHeading>
      <div className="detail-banner" aria-hidden="true">
        <div className="detail-plate">
          <span>bàn.</span>
        </div>
        <div className="detail-caption">
          Dành chỗ cho
          <br />
          <em>những câu chuyện.</em>
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <section className="content-section">
            <h2>Đôi nét về nhà hàng</h2>
            <p className="body-copy">
              {restaurant.description ??
                'Thông tin giới thiệu đang được nhà hàng cập nhật.'}
            </p>
            <div className="chip-row">
              {restaurant.cuisines.map(({ cuisine }) => (
                <span className="chip" key={cuisine.id}>
                  {cuisine.name}
                </span>
              ))}
            </div>
          </section>
          <section className="content-section">
            <h2>Tiện ích & không gian</h2>
            {restaurant.amenities.length ? (
              <div className="amenity-grid">
                {restaurant.amenities.map(({ amenity }) => (
                  <span key={amenity.id}>
                    <span aria-hidden="true">✓</span> {amenity.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted-text">Nhà hàng chưa cập nhật tiện ích.</p>
            )}
          </section>
          <section className="content-section">
            <h2>Thực đơn</h2>
            {restaurant.menus.length ? (
              restaurant.menus.map((menu) => (
                <div className="menu-row" key={menu.id}>
                  <span aria-hidden="true">▤</span>
                  <strong>{menu.name}</strong>
                  <span className="small-text">Tại nhà hàng</span>
                </div>
              ))
            ) : (
              <p className="muted-text">Thực đơn đang được cập nhật.</p>
            )}
          </section>
          <section className="content-section">
            <h2>Chia sẻ từ thực khách</h2>
            {reviews.loading ? (
              <p>Đang tải đánh giá…</p>
            ) : reviews.error ? (
              <p className="muted-text">Chưa tải được đánh giá.</p>
            ) : reviews.data?.data.length ? (
              reviews.data.data.map((review) => (
                <article className="review" key={review.id}>
                  <strong>★ {review.overallRating}/5</strong>
                  <p>{review.content ?? 'Khách đã để lại đánh giá.'}</p>
                  <time dateTime={review.createdAt}>
                    {new Intl.DateTimeFormat('vi-VN', {
                      timeZone: restaurant.timezone,
                    }).format(new Date(review.createdAt))}
                  </time>
                </article>
              ))
            ) : (
              <p className="muted-text">
                Những câu chuyện đầu tiên sẽ xuất hiện ở đây.
              </p>
            )}
          </section>
        </div>
        <AvailabilityPicker restaurant={restaurant} />
      </div>
    </div>
  );
}
