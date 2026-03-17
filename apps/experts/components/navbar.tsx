'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50"
      style={{ background: 'var(--color-bg-base)', borderBottom: '1px solid var(--color-border)', height: 'var(--nav-height, 56px)' }}
    >
      <nav
        className="mx-auto flex items-center justify-between h-full"
        style={{ maxWidth: 'var(--max-content)', padding: '0 var(--section-x)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/logo.png" alt="RawEval" width={90} height={26} style={{ objectFit: 'contain' }} priority />
          </Link>
          <span style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
          <span className="mono-label" style={{ color: 'var(--color-text-faint)', fontSize: '10px' }}>Expert Portal</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/dashboard" className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 12px' }}>Dashboard</Link>
          <Link href="/workbench" className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 12px' }}>Workbench</Link>
          <Link href="/interview/setup" className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 12px' }}>Interview</Link>
          <Link href="/history" className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 12px' }}>History</Link>
          <Link href="/profile" className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 12px' }}>Profile</Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="https://raweval.com" className="nav-link" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            raweval.com
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.4 }}><path d="M3 1h6v6M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
          </Link>
          <button className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut style={{ width: 12, height: 12 }} />
            Sign out
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: 'var(--color-text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden" style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-5)', background: 'var(--color-bg-base)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: '10px 8px' }}>Dashboard</Link>
            <Link href="/workbench" onClick={() => setMobileOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: '10px 8px' }}>Workbench</Link>
            <Link href="/interview/setup" onClick={() => setMobileOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: '10px 8px' }}>Interview</Link>
            <Link href="/history" onClick={() => setMobileOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: '10px 8px' }}>History</Link>
            <Link href="/profile" onClick={() => setMobileOpen(false)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: '10px 8px' }}>Profile</Link>
          </div>
        </div>
      )}
    </header>
  );
}
