import { BookingForm } from '@/features/bookings/booking-form';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const value = (key: string) =>
    typeof query[key] === 'string' ? (query[key] as string) : undefined;
  return (
    <BookingForm
      date={value('date')}
      slot={value('slot')}
      partySize={value('partySize')}
    />
  );
}
