import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'this chat does not exist',
  description: 'GIRLSET — live feed'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
