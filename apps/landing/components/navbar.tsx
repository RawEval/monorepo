'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { appUrls } from '@raweval/utils/urls';
import {
  Menu,
  X,
  ChevronDown,
  Search,
  UserCheck,
  Shield,
  Database,
} from 'lucide-react';

const howItWorksLinks = [
  {
    label: 'Data Capture',
    getHref: () => appUrls.landing('/how-it-works/capture'),
    description: 'Shadow execution & failure detection',
    icon: <Search className="h-4 w-4" />,
    color: 'text-blue-600',
  },
  {
    label: 'Expert Vetting',
    getHref: () => appUrls.landing('/how-it-works/vetting'),
    description: '30-min biometric interviews',
    icon: <UserCheck className="h-4 w-4" />,
    color: 'text-purple-600',
  },
  {
    label: 'Secure Workbench',
    getHref: () => appUrls.landing('/how-it-works/workbench'),
    description: 'Monitored task completion',
    icon: <Shield className="h-4 w-4" />,
    color: 'text-emerald-600',
  },
  {
    label: 'Validation & Delivery',
    getHref: () => appUrls.landing('/how-it-works/delivery'),
    description: 'Quality scoring & API delivery',
    icon: <Database className="h-4 w-4" />,
    color: 'text-amber-600',
  },
];

const navLinks = [
  { label: 'Chat', getHref: () => appUrls.chat() },
  { label: 'For Experts', getHref: () => appUrls.experts() },
  {
    label: 'For Organizations',
    getHref: () => appUrls.landing('/organizations'),
  },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            {/* How it Works Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
              >
                How it Works
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="border-border animate-fade-in-up absolute top-full left-0 mt-2 w-72 rounded-xl border bg-white py-2 shadow-lg">
                  <div className="px-3 py-2">
                    <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      The Life of a Prompt
                    </p>
                  </div>
                  {howItWorksLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.getHref()}
                      onClick={() => setDropdownOpen(false)}
                      className="group flex items-start gap-3 px-3 py-2.5 transition-colors hover:bg-blue-50"
                    >
                      <div
                        className={`border-border flex h-8 w-8 items-center justify-center rounded-lg border bg-slate-50 group-hover:bg-white ${link.color} shrink-0`}
                      >
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground mb-0.5 text-sm font-medium group-hover:text-blue-600">
                          {link.label}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="border-border mt-2 border-t px-3 pt-2">
                    <Link
                      href={appUrls.landing('/#how-it-works')}
                      onClick={() => setDropdownOpen(false)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      View overview →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.getHref()}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href={appUrls.chat()}>Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={appUrls.landing('/organizations')}>Book a demo</Link>
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
              {/* How it Works Section */}
              <div>
                <div className="px-2 py-2">
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    How it Works
                  </p>
                </div>
                {howItWorksLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.getHref()}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-3 px-2 py-2 text-sm transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`border-border flex h-6 w-6 items-center justify-center rounded-lg border bg-slate-50 ${link.color} shrink-0`}
                    >
                      {link.icon}
                    </div>
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Other Nav Links */}
              <div className="border-border border-t pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.getHref()}
                    className="text-muted-foreground hover:text-foreground block px-2 py-2 text-sm transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* CTAs */}
              <div className="border-border flex flex-col gap-2 border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  asChild
                >
                  <Link href={appUrls.chat()}>Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={appUrls.landing('/organizations')}>
                    Book a demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
