'use client';

import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { appUrls } from '@raweval/utils/urls';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* Animated background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-cyan-50/50" />
      
      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="h-4 w-4" />
            <span>Ready to Get Started?</span>
          </div>
          <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Pick Your Platform and Start
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg leading-relaxed">
            Choose the platform that fits your needs. Chat for users, Workbench for experts, or Enterprise for teams.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              size="lg" 
              className="h-12 gap-2 px-8 text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all" 
              asChild
            >
              <Link href={appUrls.landing('/#platforms')}>
                Explore All Platforms
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
              asChild
            >
              <Link href={appUrls.chat()}>
                Start Chatting
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
