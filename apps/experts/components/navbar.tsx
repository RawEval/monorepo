'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { appUrls } from '@raweval/utils/urls';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-border fixed top-0 right-0 left-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="text-foreground text-lg font-semibold">
              RawEval
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href={appUrls.landing()}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Home
            </Link>
            <Link
              href={appUrls.experts()}
              className="text-foreground text-sm font-medium"
            >
              For Experts
            </Link>
            <Link
              href={appUrls.landing('/organizations')}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              For Organizations
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/workbench">Access Workbench</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="p-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-border border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href={appUrls.landing()}
                className="text-muted-foreground hover:text-foreground px-2 py-2 text-sm transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href={appUrls.experts()}
                className="text-foreground px-2 py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Experts
              </Link>
              <Link
                href={appUrls.landing('/organizations')}
                className="text-muted-foreground hover:text-foreground px-2 py-2 text-sm transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Organizations
              </Link>
              <div className="border-border flex flex-col gap-2 border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  asChild
                >
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/workbench">Access Workbench</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
