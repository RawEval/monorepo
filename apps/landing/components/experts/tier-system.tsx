'use client';

import {
  Award,
  TrendingUp,
  Star,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const tiers = [
  {
    tier: 3,
    name: 'Standard',
    rate: '$2-4',
    description:
      'Starting tier for new experts. Complete the interview and start earning immediately.',
    requirements: [
      'Pass identity verification',
      'Complete 30-minute domain interview',
      'Demonstrate subject matter expertise',
    ],
    color: 'slate',
  },
  {
    tier: 2,
    name: 'Verified',
    rate: '$5-8',
    description:
      'Proven track record with consistent quality. Unlocked after 50+ approved submissions.',
    requirements: [
      '50+ approved corrections',
      '90%+ quality score',
      '< 5% rejection rate',
    ],
    color: 'blue',
  },
  {
    tier: 1,
    name: 'Gold Standard',
    rate: '$10-15',
    description:
      'Top experts whose work defines the benchmark. Your corrections become the gold standard.',
    requirements: [
      '200+ approved corrections',
      '97%+ quality score',
      'Specialist in high-demand domain',
    ],
    color: 'amber',
  },
];

const colorMap: Record<
  string,
  { bg: string; border: string; text: string; badge: string }
> = {
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
};

export function TierSystem() {
  return (
    <section className="bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-amber-600">Progression</p>
          <h2 className="text-foreground mb-4 text-3xl font-semibold md:text-4xl">
            Grow your earning potential
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Start at Tier 3, prove your quality, and advance to higher tiers
            with better rates. Top experts earn 3-5x more.
          </p>
        </div>

        {/* Tier progression */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {tiers.map((tier, index) => {
            const colors = colorMap[tier.color] ?? colorMap.slate!;
            return (
              <div
                key={tier.tier}
                className={`relative rounded-2xl border-2 bg-white p-6 ${colors.border}`}
              >
                {tier.tier === 1 && (
                  <div className="absolute -top-3 right-6 flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
                    <Star className="h-3 w-3" />
                    Top Tier
                  </div>
                )}

                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center`}
                  >
                    <span className={`text-xl font-bold ${colors.text}`}>
                      {tier.tier}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold">
                      {tier.name}
                    </h3>
                    <span className={`text-sm ${colors.text} font-medium`}>
                      {tier.rate}/prompt
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 text-sm">
                  {tier.description}
                </p>

                <div className="space-y-2">
                  <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                    Requirements
                  </div>
                  {tier.requirements.map((req) => (
                    <div key={req} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`h-4 w-4 ${colors.text} mt-0.5 shrink-0`}
                      />
                      <span className="text-foreground text-sm">{req}</span>
                    </div>
                  ))}
                </div>

                {/* Arrow to next tier */}
                {index < tiers.length - 1 && (
                  <div className="absolute top-1/2 -right-3 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-slate-200 bg-white md:flex">
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* How to advance */}
        <div className="border-border rounded-2xl border bg-white p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold">How to advance</h3>
              <p className="text-muted-foreground text-sm">
                Your path from Tier 3 to Gold Standard
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                1
              </div>
              <h4 className="text-foreground mb-1 font-medium">
                Complete tasks
              </h4>
              <p className="text-muted-foreground text-sm">
                Work on prompts in your area of expertise
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                2
              </div>
              <h4 className="text-foreground mb-1 font-medium">Get reviewed</h4>
              <p className="text-muted-foreground text-sm">
                Higher-tier experts validate your work
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                3
              </div>
              <h4 className="text-foreground mb-1 font-medium">
                Build quality score
              </h4>
              <p className="text-muted-foreground text-sm">
                Consistent accuracy unlocks promotions
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-600">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-foreground mb-1 font-medium">Advance tier</h4>
              <p className="text-muted-foreground text-sm">
                Higher rates and priority task access
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
