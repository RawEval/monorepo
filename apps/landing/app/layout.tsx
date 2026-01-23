import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { StaffToolbar } from '../components/staff-toolbar';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'RawEval | AI Evaluation Infrastructure',
  description:
    'Infrastructure for AI evaluation at scale. Shadow Search, Expert Gauntlet, Gold Dataset, Enterprise API.',
  keywords: [
    'AI',
    'evaluation',
    'infrastructure',
    'machine learning',
    'ML',
    'enterprise',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="facebook-domain-verification"
          content="qbu1ise9g0wxlthex5sqz2764kdg4o"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '906259072138243');
            fbq('init', '1860126784625257');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=906259072138243&ev=PageView&noscript=1"
            alt=""
          />
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1860126784625257&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <Navbar />
        {children}
        <Footer />
        <Suspense fallback={null}>
          <StaffToolbar />
        </Suspense>
      </body>
    </html>
  );
}
