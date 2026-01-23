'use client';

import { cn } from '@raweval/utils';
import Link from 'next/link';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
  toc: { id: string; title: string }[];
}

export function LegalLayout({
  children,
  title,
  lastUpdated,
  toc,
}: LegalLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-24 lg:px-8 lg:pt-32">
      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Sidebar */}
        <aside className="flex-shrink-0 lg:w-64">
          <div className="sticky top-32">
            <div className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
              Legal
            </div>
            <nav className="space-y-1">
              <Link
                href="/legal/terms"
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  title === 'Terms of Service'
                    ? 'bg-slate-100 text-blue-600'
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
                )}
              >
                Terms of Service
              </Link>
              <Link
                href="/legal/privacy"
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  title === 'Privacy Policy'
                    ? 'bg-slate-100 text-blue-600'
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
                )}
              >
                Privacy Policy
              </Link>
            </nav>

            <div className="text-muted-foreground mt-8 mb-4 text-sm font-semibold tracking-wider uppercase">
              On this page
            </div>
            <nav className="border-border space-y-1 border-l pl-4">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-muted-foreground block py-1 text-sm transition-colors hover:text-blue-600"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="border-border mb-8 border-b pb-8">
            <h1 className="text-foreground mb-4 text-4xl font-bold">{title}</h1>
            <p className="text-muted-foreground text-lg">
              Last Updated: {lastUpdated}
            </p>
          </div>
          <div className="prose prose-slate prose-lg prose-headings:scroll-mt-32 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground max-w-3xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
