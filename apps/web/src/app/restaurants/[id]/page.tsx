import { RestaurantDetail } from '@/features/restaurants/restaurant-detail';
export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <RestaurantDetail id={(await params).id} />;
}
