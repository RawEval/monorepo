'use client';

import { useEffect, useState } from 'react';
import { Button } from '@raweval/ui/button';
import { ArrowRight, Sparkles, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import { appUrls } from '@raweval/utils/urls';

export function ExpertsHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-50/50 via-white to-white" />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%230f172a'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-4 py-2 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              Join 2,400+ domain experts
            </span>
          </div>

          <h1
            className={`text-foreground mb-6 text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl lg:text-6xl ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
          >
            You already write prompts.
            <br />
            <span className="text-purple-600">Now get paid for them.</span>
          </h1>

          <p
            className={`text-muted-foreground mx-auto mb-8 max-w-2xl text-lg md:text-xl ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}
          >
            Every day, you refine AI responses to get better answers. With
            RawEval, those corrections become valuable training data — and you
            earn for every prompt you improve.
          </p>

          <div
            className={`mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}
          >
            <Button
              size="lg"
              className="h-12 gap-2 bg-purple-600 px-6 text-base hover:bg-purple-700"
              asChild
            >
              <Link href={appUrls.experts('#apply')}>
                Apply as an Expert
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-6 text-base" asChild>
              <Link href={appUrls.landing('/#how-it-works')}>
                Learn how it works
              </Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div
            className={`mx-auto grid max-w-lg grid-cols-3 gap-8 ${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}
          >
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span className="text-foreground text-2xl font-bold">
                  $2-15
                </span>
              </div>
              <p className="text-muted-foreground text-sm">per prompt</p>
            </div>
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-foreground text-2xl font-bold">
                  Flexible
                </span>
              </div>
              <p className="text-muted-foreground text-sm">work anytime</p>
            </div>
            <div className="text-center">
              <div className="text-foreground mb-1 text-2xl font-bold">
                Real
              </div>
              <p className="text-muted-foreground text-sm">AI impact</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
