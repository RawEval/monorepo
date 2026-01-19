'use client';

import Link from 'next/link';
import { appUrls } from '@raweval/utils/urls';

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
          <div>
            <h4 className="text-foreground mb-4 font-medium">For Experts</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={appUrls.experts()}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Overview
                </Link>
              </li>
              <li>
                <Link
                  href="/workbench"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Workbench
                </Link>
              </li>
              <li>
                <Link
                  href={appUrls.landing('/how-it-works/workbench')}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-4 font-medium">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={appUrls.landing('/#about')}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={appUrls.landing('/careers')}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:experts@raweval.com"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-4 font-medium">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href={appUrls.landing('/privacy')}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={appUrls.landing('/terms')}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} RawEval Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
