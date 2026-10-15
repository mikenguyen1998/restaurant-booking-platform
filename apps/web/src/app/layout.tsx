import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { SessionProvider } from '@/providers/session-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'Bàn — Khám phá nhà hàng Hà Nội', template: '%s · Bàn' },
  description:
    'Tìm một nơi thật hợp để cùng nhau ăn ngon. Khám phá nhà hàng và chuẩn bị những cuộc hẹn tại Hà Nội.',
};
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi">
      <body>
        <SessionProvider>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
