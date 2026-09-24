import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Restaurant Discovery & Booking Platform',
  description: 'Discover restaurants and manage reservations.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
