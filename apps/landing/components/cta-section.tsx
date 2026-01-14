'use client';

import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { ArrowRight } from 'lucide-react';
import { appUrls } from '@raweval/utils/urls';

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-foreground mb-4 text-3xl font-semibold md:text-4xl">
            Getting started is easy
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-lg">
            Start building with clean, human-verified training data today.
          </p>
          <Button size="lg" className="h-12 gap-2 px-8 text-base" asChild>
            <Link href={appUrls.landing('/organizations')}>
              Book a demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
