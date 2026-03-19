import type { Metadata } from 'next';
import { DM_Mono, Instrument_Serif } from 'next/font/google';
import { Suspense } from 'react';
import { StaffToolbar } from '../components/staff-toolbar';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import './globals.css';

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'RawEval Research | Verified AI Evaluation Data Marketplace',
  description:
    'Access gold-standard, human-verified training data for your AI research. RLHF preference pairs, corrected completions, and rubric-scored evaluations via API or batch export.',
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
      >
        <Navbar />
        <main id="main-content" style={{ paddingTop: 'var(--nav-height)' }}>
          {children}
        </main>
        <Footer />
        <Suspense fallback={null}>
          <StaffToolbar />
        </Suspense>
      </body>
    </html>
  );
}
