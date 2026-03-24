'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, MessageSquare, Wrench, Building2 } from 'lucide-react';

const products = [
  {
    icon: MessageSquare,
    label: 'Chat',
    description: 'Chat with AI, spot mistakes, earn rewards',
    href: '/chat',
    accent: 'var(--color-signal)',
  },
  {
    icon: Wrench,
    label: 'Work',
    description: 'Expert workbench — evaluate AI, get paid',
    href: '/work',
    accent: 'var(--color-info)',
  },
  {
    icon: Building2,
    label: 'Research',
    description: 'Marketplace for verified AI evaluation data',
    href: '/research',
    accent: 'var(--color-success)',
    comingSoon: false,
  },
];

interface GetStartedDropdownProps {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'large';
}

export function GetStartedDropdown({ variant = 'primary', size = 'default' }: GetStartedDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const btnClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const padStyle = size === 'large'
    ? { padding: '16px 32px', fontSize: 'var(--text-sm)' }
    : {};

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className={btnClass}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        style={{ ...padStyle, gap: 8 }}
      >
        Get Started
        <ChevronDown
          size={14}
          style={{
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 'min(280px, 90vw)',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--color-border)',
            overflow: 'hidden',
            animation: 'dropdown-in 0.15s ease-out',
            zIndex: 100,
          }}
          role="menu"
        >
          {products.map((product) => {
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
                  gap: 'var(--space-4)',
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  transition: 'background 0.15s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--color-bg-muted)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: `${product.accent}15`,
                    border: `1px solid ${product.accent}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} style={{ color: product.accent }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 500,
                      }}
                    >
                      {product.label}
                    </span>
                    {product.comingSoon && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          color: 'var(--color-text-faint)',
                          letterSpacing: 'var(--tracking-wide)',
                          padding: '1px 5px',
                          background: 'var(--color-bg-elevated)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        SOON
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
