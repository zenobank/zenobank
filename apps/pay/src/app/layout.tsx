import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { TanstackQuery } from '@/src/lib/providers/tanstack-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/src/lib/providers/theme-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Zenobank Pay',
  description: 'Cryptocurrency payment processing',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TanstackQuery>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </TanstackQuery>
      </body>
    </html>
  );
}
