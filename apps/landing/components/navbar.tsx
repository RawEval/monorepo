'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, MessageSquare, Wrench, Building2 } from 'lucide-react';

const navLinks = [
  { label: 'Product', href: '/how-it-works/capture' },
  { label: 'Enterprise', href: '/research' },
  { label: 'Docs', href: '/developers' },
  { label: 'Blog', href: '/blog' },
];

const productLinks = [
  { icon: MessageSquare, label: 'Chat', description: 'Chat with AI, earn rewards', href: '/chat', accent: 'var(--color-signal)' },
  { icon: Wrench, label: 'Work', description: 'Expert evaluation workbench', href: '/work', accent: 'var(--color-info)' },
  { icon: Building2, label: 'Research', description: 'Marketplace for verified AI evaluation data', href: '/research', accent: 'var(--color-success)' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close mobile menu if screen resizes to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setMobileOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const closeMobile = () => setMobileOpen(false);
  const headerBg = scrolled || mobileOpen;

  return (
    <>
      {/* Fixed header bar — always on top */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: headerBg ? 'rgba(10, 10, 11, 0.95)' : 'rgba(10, 10, 11, 0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: headerBg ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <nav
          style={{
            maxWidth: 'var(--max-content)',
            margin: '0 auto',
            padding: '0 var(--section-x)',
            height: 'var(--nav-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" aria-label="RawEval home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/logo.png"
              alt="RawEval"
              width={96}
              height={28}
              style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(55%) sepia(82%) saturate(2200%) hue-rotate(344deg) brightness(105%) contrast(96%)' }}
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 14px', borderRadius: 'var(--radius-md)' }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a href="https://chat.raweval.com/login" className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 14px' }}>
              Log in
            </a>
            <NavGetStarted />
          </div>

          {/* Mobile hamburger / X */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden"
            style={{ padding: 8, color: 'var(--color-text-primary)', background: 'none', border: 'none', cursor: 'pointer', zIndex: 210 }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      {/* Mobile menu — full screen overlay, only exists on mobile when open */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 150,
            background: 'var(--color-bg-base)',
            paddingTop: 'calc(var(--nav-height) + 12px)',
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 24,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMobile}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 18,
                color: 'var(--color-text-primary)',
                padding: '14px 0',
                borderBottom: '1px solid var(--color-border-subtle)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Products section */}
          <div style={{ marginTop: 20 }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
              marginBottom: 8,
            }}>
              Products
            </p>
            {productLinks.map((product) => {
              const Icon = product.icon;
              return (
                <Link
                  key={product.label}
                  href={product.href}
                  onClick={closeMobile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <Icon size={18} style={{ color: product.accent, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-primary)' }}>
                      {product.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {product.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Auth section */}
          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--color-border-subtle)' }}>
            <a
              href="https://chat.raweval.com/login"
              onClick={closeMobile}
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                color: 'var(--color-text-secondary)',
                padding: '14px 0',
                textDecoration: 'none',
              }}
            >
              Log in
            </a>
            <Link
              href="/chat"
              className="btn-primary"
              onClick={closeMobile}
              style={{ display: 'flex', width: '100%', justifyContent: 'center', padding: '14px 24px', marginTop: 8, textDecoration: 'none' }}
            >
              Get Started →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Desktop "Get Started" dropdown
 */
function NavGetStarted() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn-primary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ gap: 6 }}
      >
        Get Started
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 260,
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            zIndex: 300,
          }}
        >
          {productLinks.map((product, i) => {
            const Icon = product.icon;
            return (
              <Link
                key={product.label}
                href={product.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderBottom: i < productLinks.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Icon size={16} style={{ color: product.accent, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {product.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {product.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
