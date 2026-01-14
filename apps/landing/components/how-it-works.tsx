'use client';

import Link from 'next/link';
import {
  Search,
  UserCheck,
  Shield,
  Database,
  Send,
  ArrowRight,
} from 'lucide-react';

const phases = [
  {
    phase: 'Phase 1',
    title: 'Capture',
    subtitle: 'Real User Queries',
    icon: <Search className="h-6 w-6" />,
    color: 'blue',
    href: '/how-it-works/capture',
    items: [
      'Collect prompts from live search traffic',
      'Identify where current models fail',
      'Queue problematic responses for evaluation',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Vetting',
    subtitle: 'Expert Qualification',
    icon: <UserCheck className="h-6 w-6" />,
    color: 'purple',
    href: '/how-it-works/vetting',
    items: [
      '30-minute live domain interview',
      'Biometric identity verification',
      'Expertise scoring & tier assignment',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Correction',
    subtitle: 'Secure Workbench',
    icon: <Shield className="h-6 w-6" />,
    color: 'emerald',
    href: '/how-it-works/workbench',
    items: [
      'Multi-tier expert review per prompt',
      'Continuous 60-second verification',
      'Anti-AI keystroke monitoring',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Delivery',
    subtitle: 'Gold Standard Data',
    icon: <Database className="h-6 w-6" />,
    color: 'amber',
    href: '/how-it-works/delivery',
    items: [
      'Quality scoring against gold answers',
      'Measurable accuracy improvement',
      'API delivery to your ML pipeline',
    ],
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-blue-600">How it works</p>
          <h2 className="text-foreground mb-4 text-3xl font-semibold md:text-4xl">
            The life of a prompt
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            From user query to gold-standard training data — every step secured
            and validated.
          </p>
        </div>

        {/* Phases grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {phases.map((phase, index) => {
            const colors = colorMap[phase.color];
            return (
              <div key={phase.title} className="group relative">
                <div
                  className={`relative rounded-2xl border p-6 ${colors.border} ${colors.bg} card-hover flex h-full flex-col`}
                >
                  {/* Phase badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${colors.bg} border ${colors.border} mb-4`}
                  >
                    <span className={`text-xs font-medium ${colors.text}`}>
                      {phase.phase}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`h-12 w-12 rounded-xl border bg-white ${colors.border} mb-4 flex items-center justify-center ${colors.text}`}
                  >
                    {phase.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-foreground mb-1 text-lg font-semibold">
                    {phase.title}
                  </h3>
                  <p className={`text-sm ${colors.text} mb-4 font-medium`}>
                    {phase.subtitle}
                  </p>

                  <ul className="mb-6 flex-1 space-y-2">
                    {phase.items.map((item, i) => (
                      <li
                        key={i}
                        className="text-muted-foreground flex items-start gap-2 text-sm"
                      >
                        <ArrowRight
                          className={`mt-0.5 h-3.5 w-3.5 ${colors.text} shrink-0`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Learn more link */}
                  <Link
                    href={phase.href}
                    className={`inline-flex items-center gap-1 text-sm font-medium ${colors.text} group/link transition-all hover:gap-2`}
                  >
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                  </Link>

                  {/* Connector */}
                  {index < phases.length - 1 && (
                    <div className="absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 lg:block">
                      <div className="border-border flex h-6 w-6 items-center justify-center rounded-full border bg-white">
                        <ArrowRight className="text-muted-foreground h-3 w-3" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
