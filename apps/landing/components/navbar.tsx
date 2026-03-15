'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';

const products = [
  { label: 'Chat', desc: 'Evaluate models through natural conversation', href: 'https://chat.raweval.com' },
  { label: 'Expert Network', desc: 'Join 2,400+ verified domain experts', href: 'https://experts.raweval.com' },
  { label: 'Workbench', desc: 'Annotation & evaluation tooling', href: 'https://workbench.raweval.com' },
];

const company = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50"
      style={{ background: 'var(--color-bg-base)', borderBottom: '1px solid var(--color-border)' }}
    >
      <nav
        className="mx-auto flex h-14 items-center justify-between"
        style={{ maxWidth: 'var(--max-content)', padding: '0 var(--section-x)' }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="RawEval" width={96} height={28} style={{ objectFit: 'contain' }} priority />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">

          {/* Products dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: productsOpen ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                transition: 'color 0.15s ease',
              }}
            >
              Products <ChevronDown style={{ width: 14, height: 14, opacity: 0.6 }} />
            </button>
            {productsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px',
                  minWidth: '240px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 100,
                }}
              >
                {products.map((p) => (
                  <Link
                    key={p.label}
                    href={p.href}
                    style={{ display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'background 0.1s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-surface)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>{p.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{p.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Company dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCompanyOpen(true)}
            onMouseLeave={() => setCompanyOpen(false)}
          >
            <button
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: companyOpen ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                transition: 'color 0.15s ease',
              }}
            >
              Company <ChevronDown style={{ width: 14, height: 14, opacity: 0.6 }} />
            </button>
            {companyOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px',
                  minWidth: '160px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 100,
                }}
              >
                {company.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    style={{ display: 'block', padding: '8px 12px', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', textDecoration: 'none', transition: 'background 0.1s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-surface)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/organizations"
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', padding: '8px 12px', textDecoration: 'none', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            Enterprise
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="https://chat.raweval.com"
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            Sign in
          </Link>
          <Link
            href="#get-access"
            style={{
              background: 'var(--color-signal)',
              color: 'var(--color-text-inverse)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wide)',
              padding: '9px 18px',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              transition: 'background 0.15s ease',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-signal-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-signal)')}
          >
            Get early access →
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: 'var(--color-text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-6) var(--space-5)', background: 'var(--color-bg-base)' }}
        >
          <div className="flex flex-col gap-1">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', padding: '4px 8px', marginBottom: '4px' }}>Products</div>
            {products.map((p) => (
              <Link key={p.label} href={p.href} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: '8px', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>{p.label}</Link>
            ))}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-faint)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', padding: '4px 8px', marginTop: '8px', marginBottom: '4px' }}>Company</div>
            {company.map((c) => (
              <Link key={c.label} href={c.href} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: '8px', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>{c.label}</Link>
            ))}
            <Link href="/organizations" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: '8px', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>Enterprise</Link>
            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '12px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="https://chat.raweval.com" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', padding: '8px', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link
                href="#get-access"
                style={{ background: 'var(--color-signal)', color: 'var(--color-text-inverse)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)', padding: '11px 20px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', textAlign: 'center' as const }}
                onClick={() => setMobileOpen(false)}
              >
                Get early access →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
