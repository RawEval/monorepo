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
  metadataBase: new URL('https://www.raweval.com'),
  title: {
    default: 'RawEval — Turn AI Failures into Training Data',
    template: '%s | RawEval',
  },
  description:
    'AI evaluation infrastructure that captures failed AI responses, routes them to 2,400+ verified domain experts, and delivers audit-ready RLHF data.',
  keywords: [
    'AI evaluation',
    'RLHF',
    'training data',
    'AI quality',
    'domain experts',
    'AI infrastructure',
    'LLM evaluation',
    'EU AI Act',
    'human feedback',
  ],
  authors: [{ name: 'RawEval' }],
  creator: 'RawEval',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.raweval.com',
    siteName: 'RawEval',
    title: 'RawEval — Turn AI Failures into Training Data',
    description:
      'AI evaluation infrastructure. Capture. Verify. Deliver.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RawEval — AI Evaluation Infrastructure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RawEval — Turn AI Failures into Training Data',
    description:
      'AI evaluation infrastructure. Capture. Verify. Deliver.',
    images: ['/og-image.png'],
    creator: '@raweval',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
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
        className={`${dmMono.variable} ${instrumentSerif.variable}`}
      >
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
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

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'RawEval',
              applicationCategory: 'DeveloperApplication',
              description:
                'AI evaluation infrastructure that captures failed AI responses, routes them to verified domain experts, and delivers audit-ready RLHF data.',
              url: 'https://www.raweval.com',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />

        <Navbar />
        <main id="main-content">
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
