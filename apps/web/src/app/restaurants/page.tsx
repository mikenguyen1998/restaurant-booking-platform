import type { Metadata } from 'next';
import { PageHeading } from '@/components/shared/ui';
import { RestaurantList } from '@/features/restaurants/restaurant-list';
export const metadata: Metadata = { title: 'Khám phá nhà hàng' };
export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) =>
    typeof params[key] === 'string' ? (params[key] as string) : '';
  const query = new URLSearchParams();
  for (const key of [
    'name',
    'city',
    'district',
    'cuisine',
    'priceLevel',
    'page',
  ])
    if (value(key)) query.set(key, value(key));
  return (
    <div className="container section">
      <PageHeading
        eyebrow="Khám phá Hà Nội"
        title="Tìm một nơi thật hợp."
        description="Một bữa ngon cho những cuộc hẹn lớn nhỏ."
      />
      <form className="filter-bar" action="/restaurants">
        <label>
          Tên nhà hàng
          <input
            name="name"
            defaultValue={value('name')}
            placeholder="Bạn đang tìm nơi nào?"
          />
        </label>
        <label>
          Khu vực
          <input
            name="district"
            defaultValue={value('district')}
            placeholder="Quận / huyện"
          />
        </label>
        <label>
          Ẩm thực
          <select name="cuisine" defaultValue={value('cuisine')}>
            <option value="">Tất cả hương vị</option>
            <option value="vietnamese">Việt Nam</option>
            <option value="japanese">Nhật Bản</option>
          </select>
        </label>
        <label>
          Mức giá
          <select name="priceLevel" defaultValue={value('priceLevel')}>
            <option value="">Mọi mức giá</option>
            {[1, 2, 3, 4].map((n) => (
              <option value={n} key={n}>
                {'₫'.repeat(n)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="button">
          Tìm nhà hàng ↗
        </button>
      </form>
      <RestaurantList query={query.toString()} />
    </div>
  );
}
