'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@raweval/ui/button';

interface StepNavProps {
  currentStep: number;
  totalSteps: number;
  prevLink?: string;
  nextLink?: string;
  title: string;
  subtitle?: string;
}

const steps = [
  { number: 1, title: 'Data Capture', href: '/how-it-works/capture' },
  { number: 2, title: 'Expert Vetting', href: '/how-it-works/vetting' },
  { number: 3, title: 'Secure Workbench', href: '/how-it-works/workbench' },
  { number: 4, title: 'Validation & Delivery', href: '/how-it-works/delivery' },
];

export function StepNav({
  currentStep,
  totalSteps,
  prevLink,
  nextLink,
  title,
  subtitle,
}: StepNavProps) {
  return (
    <div className="border-border border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        {/* Top navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Back to home</span>
          </Link>

          <div className="flex items-center gap-2">
            {prevLink && (
              <Button variant="outline" size="sm" asChild>
                <Link href={prevLink}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Link>
              </Button>
            )}
            {nextLink && (
              <Button
                size="sm"
                asChild
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Link href={nextLink}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm font-medium text-blue-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <h1 className="text-foreground mb-2 text-3xl font-semibold md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-lg">{subtitle}</p>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {steps.map((step) => (
            <Link
              key={step.number}
              href={step.href}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step.number < currentStep
                  ? 'bg-blue-600'
                  : step.number === currentStep
                    ? 'bg-blue-600'
                    : 'bg-slate-200'
              }`}
              title={step.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
