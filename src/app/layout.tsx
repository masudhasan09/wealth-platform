import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { lightTheme } from '@/styles/themes/light';
import { themeToCss } from '@/styles/themes/themeToCss';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WealthTrack — Multi-Asset Wealth Management',
  description: 'Track equities, crypto, fixed income, real estate, and cash in one unified dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cssVariables = themeToCss(lightTheme);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-text">
        {children}
      </body>
    </html>
  );
}
