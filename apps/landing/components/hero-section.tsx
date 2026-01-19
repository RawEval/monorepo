'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { ArrowRight } from 'lucide-react';
import { appUrls } from '@raweval/utils/urls';
import { SystemDiagram } from '@/components/system-diagram';

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white" />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%230f172a'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Hero content */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h1
            className={`text-foreground mb-6 text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl lg:text-6xl ${mounted ? 'animate-fade-in-up' : 'opacity-0'} `}
          >
            Human-verified AI evaluation infrastructure
          </h1>
          <p
            className={`text-muted-foreground mx-auto mb-8 max-w-2xl text-lg md:text-xl ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'} `}
          >
            Capture, validate, and deliver gold-standard training data through
            secure expert networks. Multi-platform ecosystem for users, experts,
            and organizations.
          </p>
          <div
            className={`flex flex-col items-center justify-center gap-4 sm:flex-row ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'} `}
          >
            <Button size="lg" className="h-12 gap-2 px-6 text-base" asChild>
              <Link href={appUrls.landing('/#platforms')}>
                Explore Platforms
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base"
              asChild
            >
              <Link href={appUrls.landing('/#how-it-works')}>
                Learn How It Works
              </Link>
            </Button>
          </div>
        </div>

        {/* System diagram */}
        <div
          className={`border-border relative rounded-2xl border bg-white p-8 shadow-xl lg:p-12 ${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'} `}
        >
          <div className="absolute -top-3 left-8 flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
            <span>Interactive System Flow</span>
            <ArrowRight className="h-3 w-3" />
          </div>
          <SystemDiagram />
          <p className="text-muted-foreground mt-6 text-center text-sm">
            Click any step to explore in detail →
          </p>
        </div>
      </div>
    </section>
  );
}
