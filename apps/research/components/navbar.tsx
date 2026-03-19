'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Datasets', href: '/datasets' },
  { label: 'API', href: '/api-docs' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 50); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(10, 10, 11, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <nav
        style={{ maxWidth: 'var(--max-content)', margin: '0 auto', padding: '0 var(--section-x)', height: 'var(--nav-height)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        aria-label="Main navigation"
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-signal)', fontWeight: 500, letterSpacing: 'var(--tracking-wide)' }}>
            RawEval
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wide)', padding: '2px 6px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            RESEARCH
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 14px', borderRadius: 'var(--radius-md)' }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden md:flex">
          <Link href="/login" className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 14px' }}>
            Log in
          </Link>
          <Link href="/signup" className="btn-primary">
            Get Access
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden"
          style={{ color: 'var(--color-text-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div
            style={{ position: 'fixed', top: 'var(--nav-height)', right: 0, bottom: 0, width: 280, background: 'var(--color-bg-surface)', borderLeft: '1px solid var(--color-border)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', zIndex: 100 }}
            className="md:hidden"
          >
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', padding: '12px 8px', minHeight: 48, display: 'flex', alignItems: 'center' }}>
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
              <Link href="/signup" className="btn-primary" onClick={() => setMobileOpen(false)} style={{ width: '100%', justifyContent: 'center', padding: '14px 24px' }}>
                Get Access
              </Link>
            </div>
          </div>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, top: 'var(--nav-height)', background: 'rgba(0,0,0,0.5)', zIndex: 99 }} className="md:hidden" />
        </>
      )}
    </header>
  );
}
