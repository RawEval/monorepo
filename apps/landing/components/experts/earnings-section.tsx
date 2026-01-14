'use client';

import {
  DollarSign,
  FileText,
  Briefcase,
  Calculator,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const paymentModels = [
  {
    title: 'Per-Prompt Pay',
    subtitle: 'Flexible, on-demand work',
    icon: <FileText className="h-6 w-6" />,
    rate: '$2 - $15',
    rateLabel: 'per corrected prompt',
    description:
      'Complete tasks whenever you have time. Each prompt takes 5-15 minutes. Get paid for exactly what you do.',
    features: [
      'No commitment required',
      'Work 1 hour or 40 hours/week',
      'Rate based on complexity & your tier',
      'Weekly payouts, no minimum',
    ],
    color: 'blue',
    popular: false,
  },
  {
    title: 'Project-Based',
    subtitle: 'Fixed contracts for specialists',
    icon: <Briefcase className="h-6 w-6" />,
    rate: '$500 - $5,000',
    rateLabel: 'per project',
    description:
      'Take on dedicated projects in your specialty. Fixed scope, fixed pay, typically 1-4 weeks duration.',
    features: [
      'Guaranteed earnings',
      'Work on specialized domains',
      'Clear deliverables & timeline',
      '50% upfront, 50% on completion',
    ],
    color: 'purple',
    popular: true,
  },
];

const earningsExamples = [
  {
    hours: 5,
    perPrompt: 4,
    prompts: 20,
    weekly: 80,
    monthly: 320,
    label: 'Casual (5 hrs/week)',
  },
  {
    hours: 15,
    perPrompt: 6,
    prompts: 75,
    weekly: 450,
    monthly: 1800,
    label: 'Part-time (15 hrs/week)',
  },
  {
    hours: 30,
    perPrompt: 8,
    prompts: 180,
    weekly: 1440,
    monthly: 5760,
    label: 'Full-time (30 hrs/week)',
  },
];

export function EarningsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-emerald-600">Earnings</p>
          <h2 className="text-foreground mb-4 text-3xl font-semibold md:text-4xl">
            Two ways to earn
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Choose flexible per-prompt work or commit to project-based
            contracts. Many experts do both.
          </p>
        </div>

        {/* Payment models */}
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {paymentModels.map((model) => (
            <div
              key={model.title}
              className={`relative rounded-2xl border-2 bg-white p-8 ${
                model.popular
                  ? 'border-purple-300 ring-2 ring-purple-100'
                  : 'border-border'
              }`}
            >
              {model.popular && (
                <div className="absolute -top-3 left-6 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6 flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    model.color === 'purple'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {model.icon}
                </div>
              </div>

              <h3 className="text-foreground mb-1 text-xl font-semibold">
                {model.title}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {model.subtitle}
              </p>

              <div className="mb-6">
                <span
                  className={`text-3xl font-bold ${
                    model.color === 'purple'
                      ? 'text-purple-600'
                      : 'text-blue-600'
                  }`}
                >
                  {model.rate}
                </span>
                <span className="text-muted-foreground ml-2">
                  {model.rateLabel}
                </span>
              </div>

              <p className="text-muted-foreground mb-6">{model.description}</p>

              <div className="space-y-3">
                {model.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        model.color === 'purple'
                          ? 'text-purple-500'
                          : 'text-blue-500'
                      }`}
                    />
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Earnings calculator preview */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Calculator className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold">
                Earnings potential
              </h3>
              <p className="text-muted-foreground text-sm">
                Based on current Tier 1 expert rates
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    Commitment
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    Avg. Rate
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    Prompts/Week
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    Weekly
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    Monthly
                  </th>
                </tr>
              </thead>
              <tbody>
                {earningsExamples.map((example, i) => (
                  <tr
                    key={example.label}
                    className={
                      i < earningsExamples.length - 1
                        ? 'border-b border-slate-100'
                        : ''
                    }
                  >
                    <td className="px-4 py-4">
                      <span className="text-foreground font-medium">
                        {example.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-metric text-foreground">
                        ${example.perPrompt}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-metric text-muted-foreground">
                        {example.prompts}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-metric text-foreground font-medium">
                        ${example.weekly}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-metric font-bold text-emerald-600">
                        ${example.monthly.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground mt-4 text-center text-xs">
            * Actual earnings depend on task availability, complexity, and your
            tier level. Higher tiers earn 2-3x base rates.
          </p>
        </div>
      </div>
    </section>
  );
}
