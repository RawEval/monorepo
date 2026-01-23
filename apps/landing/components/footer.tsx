'use client';

import Link from 'next/link';
import { appUrls } from '@raweval/utils/urls';
import { Twitter, Linkedin, Youtube } from 'lucide-react';

const footerLinks = {
  Product: [
    {
      label: 'Data Capture',
      getHref: () => appUrls.landing('/how-it-works/capture'),
    },
    {
      label: 'Expert Vetting',
      getHref: () => appUrls.landing('/how-it-works/vetting'),
    },
    {
      label: 'Secure Workbench',
      getHref: () => appUrls.landing('/how-it-works/workbench'),
    },
    {
      label: 'Validation',
      getHref: () => appUrls.landing('/how-it-works/delivery'),
    },
    { label: 'Roadmap', getHref: () => appUrls.landing('#roadmap') },
  ],
  'For Experts': [
    { label: 'Apply to Join', getHref: () => appUrls.experts('/apply') }, // Assuming apply route
    { label: 'Login', getHref: () => appUrls.experts() },
    { label: 'Stories', getHref: () => appUrls.landing('/stories') }, // Placeholder
    {
      label: 'Payment Policy',
      getHref: () => appUrls.landing('/legal/payment'),
    }, // Placeholder
  ],
  Company: [
    { label: 'About Us', getHref: () => appUrls.landing('/about') },
    { label: 'Careers', getHref: () => appUrls.landing('/careers') },
    { label: 'Blog', getHref: () => appUrls.landing('/blog') },
  ],
  'Legal & Contact': [
    {
      label: 'Terms of Service',
      getHref: () => appUrls.landing('/legal/terms'),
    },
    {
      label: 'Privacy Policy',
      getHref: () => appUrls.landing('/legal/privacy'),
    },
    { label: 'Contact Support', getHref: () => appUrls.landing('/contact') },
    { label: 'Sales Inquiry', getHref: () => 'mailto:sales@raweval.com' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/raweval', label: 'Twitter' },
  {
    icon: Linkedin,
    href: 'https://linkedin.com/company/raweval',
    label: 'LinkedIn',
  },
  { icon: Youtube, href: 'https://youtube.com/raweval', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="border-border bg-muted/20 border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-12">
          {/* Brand Column (1) */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href={appUrls.landing()}
              className="mb-6 flex items-center gap-2"
            >
              <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <span className="text-foreground text-xl font-bold">RawEval</span>
            </Link>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Human-verified AI evaluation infrastructure. High-quality data for
              the next generation of models.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns (4) */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                {category}
              </h4>
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

        {/* Bottom Bar */}
        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} RawEval Inc. All rights reserved.
          </p>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
