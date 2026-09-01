import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { CSSProperties } from 'react';
import './globals.css';

function normalizeBasePath(value: string | undefined) {
  if (!value || value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

const publicBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
const assetPath = (path: string) => `${publicBasePath}${path}`;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: 'The Decision Room — Learn OLAP Cubes',
  description:
    'A visual, interactive 17-chapter journey from raw retail tables to trustworthy OLAP decisions.',
  applicationName: 'The Decision Room',
  icons: {
    icon: [
      { url: assetPath('/favicon.svg'), type: 'image/svg+xml' },
      { url: assetPath('/favicon-32.png'), type: 'image/png', sizes: '32x32' },
    ],
    shortcut: assetPath('/favicon.svg'),
    apple: [{ url: assetPath('/apple-touch-icon.png'), sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'The Decision Room — Learn OLAP Cubes',
    description: 'Learn OLAP cubes from raw rows to trusted decisions in 17 interactive chapters.',
    type: 'website',
    ...(siteUrl ? {
      images: [{
        url: assetPath('/og.png'),
        width: 1731,
        height: 909,
        alt: 'The Decision Room with a hand-drawn Month, Region, and Category cube',
      }],
    } : {}),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Decision Room — Learn OLAP Cubes',
    description: 'Learn OLAP cubes from raw rows to trusted decisions in 17 interactive chapters.',
    ...(siteUrl ? { images: [assetPath('/og.png')] } : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ '--github-mark-url': `url("${assetPath('/github-mark.svg')}")` } as CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
