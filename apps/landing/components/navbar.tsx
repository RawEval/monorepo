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
          <NavGetStarted />
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
          width: 'min(280px, 75vw)',
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

        {/* Product links for mobile */}
        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--color-text-faint)',
            padding: '4px 8px',
            marginBottom: 'var(--space-1)',
          }}>
            Products
          </p>
          {productLinks.map((product) => {
            const Icon = product.icon;
            return (
              <Link
                key={product.label}
                href={product.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  minHeight: '44px',
                }}
              >
                <Icon size={16} style={{ color: product.accent, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {product.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-faint)' }}>
                    {product.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)' }}>
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
          <Link
            href="/chat"
            className="btn-primary"
            onClick={() => setMobileOpen(false)}
            style={{ width: '100%', marginTop: 'var(--space-3)', justifyContent: 'center', padding: '14px 24px' }}
          >
            Get Started →
          </Link>
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

/**
 * Desktop "Get Started" with inline dropdown — uses the same product links.
 */
function NavGetStarted() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        className="btn-primary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        style={{ gap: 6 }}
      >
        Get Started
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
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
            animation: 'nav-dropdown-in 0.15s ease-out',
            zIndex: 100,
          }}
          role="menu"
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
                  gap: 'var(--space-3)',
                  padding: '12px 14px',
                  borderBottom: i < productLinks.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  transition: 'background 0.15s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Icon size={16} style={{ color: product.accent, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {product.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
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

