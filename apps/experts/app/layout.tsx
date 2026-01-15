import type { Metadata } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { StaffToolbar } from '../components/staff-toolbar';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'RawEval Experts | Secure Workbench',
  description:
    'Secure expert workbench for AI evaluation and annotation. Earn $2-15 per prompt with biometric verification and real-time monitoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${jetbrains.variable}`}>
        {children}
        <Suspense fallback={null}>
          <StaffToolbar />
        </Suspense>
      </body>
    </html>
  );
}
