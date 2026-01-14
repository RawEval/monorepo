'use client';

import Link from 'next/link';
import { appUrls } from '@raweval/utils/urls';

const footerLinks = {
  Product: [
    { label: 'Platform', getHref: () => appUrls.landing('#platform') },
    { label: 'How it Works', getHref: () => appUrls.landing('#how-it-works') },
    { label: 'Security', getHref: () => appUrls.landing('#security') },
    { label: 'Roadmap', getHref: () => appUrls.landing('#roadmap') },
  ],
  Company: [
    { label: 'About', getHref: () => appUrls.landing('/#about') },
    { label: 'Careers', getHref: () => appUrls.landing('/careers') },
    { label: 'Blog', getHref: () => appUrls.landing('/blog') },
    { label: 'Contact', getHref: () => 'mailto:contact@raweval.com' },
  ],
  Legal: [
    { label: 'Privacy Policy', getHref: () => appUrls.landing('/privacy') },
    { label: 'Terms of Service', getHref: () => appUrls.landing('/terms') },
    { label: 'Security', getHref: () => appUrls.landing('/#security') },
  ],
};

export function Footer() {
  return (
    <footer className="border-border bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href={appUrls.landing()} className="mb-4 flex items-center gap-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-sm font-bold text-white">R</span>
              </div>
              <span className="text-foreground text-lg font-semibold">
                RawEval
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Human-verified AI evaluation infrastructure.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-foreground mb-4 font-medium">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.getHref()}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-border mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} RawEval Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href={appUrls.landing('/legal')}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Legal
            </Link>
            <Link
              href={appUrls.landing('/privacy')}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
