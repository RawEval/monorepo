'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Product', href: '/how-it-works/capture' },
  { label: 'Enterprise', href: '/organizations' },
  { label: 'Docs', href: '/developers' },
  { label: 'Blog', href: '/blog' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50"
      style={{
        background: scrolled ? 'rgba(10, 10, 11, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
        transition: 'background 0.2s ease, border-color 0.2s ease, backdrop-filter 0.2s ease',
      }}
    >
      <nav
        className="mx-auto flex items-center justify-between"
        style={{ maxWidth: 'var(--max-content)', padding: '0 var(--section-x)', height: 'var(--nav-height)' }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" aria-label="RawEval home" className="flex items-center">
          <Image
            src="/logo.png"
            alt="RawEval"
            width={96}
            height={28}
            style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(55%) sepia(82%) saturate(2200%) hue-rotate(344deg) brightness(105%) contrast(96%)' }}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav-link"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://chat.raweval.com/login"
            className="nav-link"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              padding: '8px 14px',
            }}
          >
            Log in
          </a>
          <a
            href="https://chat.raweval.com/signup"
            className="btn-primary"
          >
            Get Started →
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          style={{ color: 'var(--color-text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu — slide-in panel */}
      <div
        className="md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        style={{
          position: 'fixed',
          top: 'var(--nav-height)',
          right: 0,
          bottom: 0,
          width: '280px',
          background: 'var(--color-bg-surface)',
          borderLeft: '1px solid var(--color-border)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease-out',
          zIndex: 100,
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          overflowY: 'auto',
        }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              color: 'var(--color-text-secondary)',
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {link.label}
          </Link>
        ))}

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
          <a
            href="https://chat.raweval.com/login"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              color: 'var(--color-text-secondary)',
              padding: '12px 8px',
              minHeight: '48px',
            }}
          >
            Log in
          </a>
          <a
            href="https://chat.raweval.com/signup"
            className="btn-primary"
            onClick={() => setMobileOpen(false)}
            style={{ width: '100%', marginTop: 'var(--space-3)', justifyContent: 'center', padding: '14px 24px' }}
          >
            Get Started →
          </a>
        </div>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            top: 'var(--nav-height)',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
          }}
        />
      )}
    </header>
  );
}
