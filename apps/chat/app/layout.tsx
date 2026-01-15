import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { StaffToolbar } from '../components/staff-toolbar';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
});

export const metadata: Metadata = {
  title: 'RawEval Chat | AI Chatbot with Expert Verification',
  description:
    'Fully reinforced AI chatbot with multimodal support. Mark incorrect responses and contribute to expert-verified training data.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Suspense fallback={null}>
          <StaffToolbar />
        </Suspense>
      </body>
    </html>
  );
}
