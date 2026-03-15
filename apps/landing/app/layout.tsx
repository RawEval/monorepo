import type { Metadata } from 'next';
import Script from 'next/script';
import { DM_Mono, Instrument_Serif } from 'next/font/google';
import { Suspense } from 'react';
import { StaffToolbar } from '../components/staff-toolbar';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
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
  title: {
    default: 'RawEval | Human-Verified AI Evaluation Infrastructure',
    template: '%s | RawEval',
  },
  description:
    'The end-to-end pipeline that catches failed AI interactions, puts them in front of verified domain experts, and delivers audit-ready training data to frontier labs.',
  keywords: ['AI evaluation', 'RLHF', 'training data', 'EU AI Act', 'annotation infrastructure', 'human feedback', 'model alignment'],
  openGraph: {
    type: 'website',
    siteName: 'RawEval',
    title: 'RawEval | Human-Verified AI Evaluation Infrastructure',
    description: 'Catch AI failures. Route to verified experts. Get training-ready data back.',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'RawEval' }],
  },
  twitter: {
    card: 'summary',
    title: 'RawEval | Human-Verified AI Evaluation Infrastructure',
    description: 'Catch AI failures. Route to verified experts. Get training-ready data back.',
    images: ['/logo.png'],
  },
  metadataBase: new URL('https://www.raweval.com'),
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
        className={`${dmMono.variable} ${instrumentSerif.variable} antialiased`}
        style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
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
