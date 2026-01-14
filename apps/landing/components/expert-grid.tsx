'use client';

import {
  CheckCircle2,
  Shield,
  Users,
  Eye,
  Keyboard,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const tiers = [
  {
    tier: 1,
    label: 'Tier 1',
    sublabel: 'Gold Standard',
    description:
      'Domain experts with 95%+ accuracy. Their corrections define the benchmark.',
    color: 'amber',
    experts: 3,
    checks: [
      'PhD or equivalent',
      '30-min interview',
      'Continuous verification',
    ],
  },
  {
    tier: 2,
    label: 'Tier 2',
    sublabel: 'Verified Experts',
    description:
      'Validated professionals. Answers compared against Tier 1 for quality scoring.',
    color: 'blue',
    experts: 3,
    checks: [
      'Domain certification',
      'Identity verified',
      'Keystroke monitoring',
    ],
  },
  {
    tier: 3,
    label: 'Tier 3',
    sublabel: 'Standard Pool',
    description:
      'Vetted contributors under full surveillance. Provides comparison baseline.',
    color: 'slate',
    experts: 3,
    checks: ['Background check', 'Biometric enrolled', 'Session recorded'],
  },
];

const securityFeatures = [
  {
    icon: <Eye className="h-4 w-4" />,
    label: 'Face Detection',
    description: '60-second verification',
  },
  {
    icon: <Keyboard className="h-4 w-4" />,
    label: 'Keystroke Analysis',
    description: 'Anti-AI filtering',
  },
  {
    icon: <Clock className="h-4 w-4" />,
    label: 'Heartbeat Check',
    description: 'Continuous presence',
  },
  {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: 'Phone Detection',
    description: 'Instant session lock',
  },
];

const colorMap: Record<
  string,
  { bg: string; border: string; text: string; accent: string }
> = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    accent: 'text-amber-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    accent: 'text-blue-600',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    accent: 'text-slate-600',
  },
};

export function ExpertGrid() {
  return (
    <section className="bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-blue-600">
            Expert Network
          </p>
          <h2 className="text-foreground mb-4 text-3xl font-semibold md:text-4xl">
            Tiered verification system
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Every prompt is evaluated by 9 experts across 3 tiers. Tier 1 sets
            the gold standard, lower tiers provide comparative data.
          </p>
        </div>

        {/* 3-3-3 Explanation */}
        <div className="border-border mb-12 rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Users className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold">
                The 3-3-3 System
              </h3>
              <p className="text-muted-foreground text-sm">
                9 experts evaluate each batch of 10 failed prompts
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((tier) => {
              const colors = colorMap[tier.color];
              return (
                <div
                  key={tier.tier}
                  className={`rounded-xl p-5 ${colors.bg} border ${colors.border}`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-lg border bg-white ${colors.border} flex items-center justify-center`}
                    >
                      <span className={`text-sm font-bold ${colors.accent}`}>
                        {tier.tier}
                      </span>
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${colors.text}`}>
                        {tier.label}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {tier.sublabel}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 text-sm">
                    {tier.description}
                  </p>

                  <div className="space-y-2">
                    {tier.checks.map((check) => (
                      <div
                        key={check}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${colors.accent}`}
                        />
                        <span className="text-foreground">{check}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-4 border-t pt-4 ${colors.border}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Experts per batch
                      </span>
                      <span className={`font-semibold ${colors.accent}`}>
                        {tier.experts}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security monitoring */}
        <div className="rounded-2xl bg-slate-900 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Continuous Monitoring
              </h3>
              <p className="text-sm text-slate-400">
                Every session is verified in real-time
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {securityFeatures.map((feature) => (
              <div
                key={feature.label}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-slate-300">
                  {feature.icon}
                </div>
                <div className="mb-1 text-sm font-medium text-white">
                  {feature.label}
                </div>
                <div className="text-xs text-slate-400">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">Sessions recorded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">Identity verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">
                AI detection active
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
