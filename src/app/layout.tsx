import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulseCare Hub',
  description: 'Next-Gen Medical Practice & Appointment Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}