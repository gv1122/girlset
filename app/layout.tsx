import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'this chat does not exist',
  description: 'GIRLSET — live feed'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
};

export default RootLayout;
