import { BookingManagement } from '@/features/bookings/booking-management';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingManagement scope="customer" initialId={id} />;
}
