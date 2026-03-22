import type { Metadata } from 'next';
import { DM_Mono, Instrument_Serif } from 'next/font/google';
import { Suspense } from 'react';
import { Providers } from '@/lib/react-query/provider';
import { StaffToolbar } from '../components/staff-toolbar';
import './globals.css';

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RawEval Chat | AI Chatbot with Expert Verification',
  description:
    'Fully reinforced AI chatbot with multimodal support. Mark incorrect responses and contribute to expert-verified training data.',
  icons: {
    icon: '/icon.svg',
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
        className={`${dmMono.variable} ${instrumentSerif.variable} antialiased`}
        style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
      >
        <Providers>
          {children}
          <Suspense fallback={null}>
            <StaffToolbar />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
