'use client';

import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { ArrowRight, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { appUrls } from '@raweval/utils/urls';

const steps = [
  {
    step: 1,
    title: 'Apply online',
    time: '5 minutes',
    description: 'Fill out a short form about your expertise',
  },
  {
    step: 2,
    title: 'Complete interview',
    time: '30 minutes',
    description: 'Live video call to verify your domain knowledge',
  },
  {
    step: 3,
    title: 'Start earning',
    time: 'Same day',
    description: 'Access the workbench and take your first task',
  },
];

export function ExpertsCTA() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800 p-12">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
            }}
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            {/* Left content */}
            <div>
              <h2 className="mb-4 text-3xl font-semibold text-white md:text-4xl">
                Ready to turn your expertise into income?
              </h2>
              <p className="mb-8 text-lg text-purple-100">
                Join thousands of domain experts who are already shaping the
                future of AI — and getting paid for it.
              </p>

              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-white px-6 text-base text-purple-700 hover:bg-purple-50"
                  asChild
                >
                  <Link href={appUrls.experts('#apply')}>
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/30 px-6 text-base text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="mailto:contact@raweval.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact us
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-purple-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No fees to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Start same day</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Weekly payouts</span>
                </div>
              </div>
            </div>

            {/* Right content - Application process */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="mb-6 font-semibold text-white">
                How to get started
              </h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <span className="font-bold text-white">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-medium text-white">
                          {step.title}
                        </span>
                        <span className="flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-xs text-purple-200">
                          <Clock className="h-3 w-3" />
                          {step.time}
                        </span>
                      </div>
                      <p className="text-sm text-purple-200">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden" /> // Placeholder for potential connector
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Have questions? Check out our{' '}
            <Link href={appUrls.experts('#faq')} className="text-purple-600 hover:underline">
              Expert FAQ
            </Link>{' '}
            or{' '}
            <Link href="mailto:contact@raweval.com" className="text-purple-600 hover:underline">
              contact our team
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
