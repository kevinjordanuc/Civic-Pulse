import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import ThemeProvider from '@/components/layout/ThemeProvider';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Civic Pulse',
  description: 'Civic engagement assistant for municipalities',
};

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
