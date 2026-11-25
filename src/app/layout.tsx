import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { lightTheme } from '@/styles/themes/light';
import { darkTheme } from '@/styles/themes/dark';
import { buildAdaptiveThemeCss } from '@/styles/themes/themeToCss';
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
  title: 'Multi-Asset Portfolio Tracking Platform',
  description: 'Track equities, crypto, fixed income, real estate, and cash in one unified dashboard.',
};

const FOUC_PREVENTION_SCRIPT =
  'try{var s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark"){var m=document.querySelector(\'meta[name="color-scheme"]\');if(m)m.content=s;}}catch(e){}';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cssVariables = buildAdaptiveThemeCss(lightTheme, darkTheme);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: FOUC_PREVENTION_SCRIPT }} />
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-text" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
