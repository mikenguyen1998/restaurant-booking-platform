'use client';
import Link from 'next/link';
import type {
  PageResult,
  RestaurantSummary,
} from '@restaurant-platform/shared';
import { useResource } from '@/lib/use-resource';
import { errorMessage } from '@/lib/api';
import { EmptyState, LoadingCards } from '@/components/shared/ui';

export function RestaurantList({
  query = '',
  limit = 12,
}: {
  query?: string;
  limit?: number;
}) {
  const params = new URLSearchParams(query);
  params.set('limit', String(limit));
  const pageHref = (page: number) => {
    const next = new URLSearchParams(params);
    next.set('page', String(page));
    return `/restaurants?${next}`;
  };
  const { data, error, loading, reload } = useResource<
    PageResult<RestaurantSummary>
  >(`/restaurants?${params}`);
  if (loading) return <LoadingCards />;
  if (error)
    return (
      <div className="connection-state">
        <p role="alert">{errorMessage(error)}</p>
        <button className="button secondary" onClick={reload}>
          Thử kết nối lại
        </button>
        <p className="small-text">
          Danh sách nhà hàng sẽ hiển thị khi kết nối được với máy chủ.
        </p>
      </div>
    );
  if (!data?.data.length)
    return (
      <EmptyState
        title="Chưa tìm thấy một bàn phù hợp"
        description="Thử đổi khu vực hoặc bỏ bớt bộ lọc để khám phá thêm."
        href="/restaurants"
        action="Xem tất cả nhà hàng"
      />
    );
  return (
    <>
      <div className="restaurant-grid">
        {data.data.map((restaurant, i) => (
          <Link
            className="restaurant-card"
            key={restaurant.id}
            href={`/restaurants/${restaurant.id}`}
          >
            <div className={`restaurant-art art-${i % 3}`} aria-hidden="true">
              <span className="art-plate" />
              <span className="art-leaf" />
              <span className="art-cutlery" />
              <span className="restaurant-tag">
                {restaurant.district ?? restaurant.city}
              </span>
            </div>
            <div className="restaurant-card-body">
              <div className="card-title-row">
                <h3>{restaurant.name}</h3>
                <span aria-hidden="true">↗</span>
              </div>
              <p>{restaurant.address}</p>
              <div className="card-meta">
                <span>{restaurant.city}</span>
                <span>{'₫'.repeat(restaurant.priceLevel)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {limit > 3 && (
        <div className="pagination-bar">
          <nav aria-label="Trang kết quả nhà hàng">
            {data.meta.currentPage > 1 && (
              <Link
                className="button secondary small"
                href={pageHref(data.meta.currentPage - 1)}
              >
                ← Trang trước
              </Link>
            )}
            {data.meta.currentPage < data.meta.totalPages && (
              <Link
                className="button secondary small"
                href={pageHref(data.meta.currentPage + 1)}
              >
                Trang sau →
              </Link>
            )}
          </nav>
          <p className="results-count">
            {data.meta.totalItems} nhà hàng · Trang {data.meta.currentPage}/
            {Math.max(1, data.meta.totalPages)}
          </p>
        </div>
      )}
    </>
  );
}
