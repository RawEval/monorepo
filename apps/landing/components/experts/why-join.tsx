'use client';

import {
  Brain,
  TrendingUp,
  Globe,
  Shield,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const reasons = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'Shape the AI you use daily',
    description:
      'Your corrections directly improve models from leading AI labs. Every fix you make helps millions of users get better answers.',
    color: 'purple',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Monetize expertise you already have',
    description:
      'You already spend hours refining AI outputs. Now turn that skill into income without changing how you work.',
    color: 'emerald',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Work from anywhere, anytime',
    description:
      'No fixed hours, no commute. Log in when you want, complete tasks at your pace, get paid weekly.',
    color: 'blue',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Your identity stays protected',
    description:
      'We verify you once, then your work is anonymized. Enterprise clients see quality, not personal data.',
    color: 'amber',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
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
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
};

const benefits = [
  'No minimum hours required',
  'Weekly payouts via PayPal or bank transfer',
  "Work on topics you're expert in",
  'Build a reputation and unlock higher rates',
  'Join a community of 2,400+ domain experts',
  'Direct impact on AI development',
];

export function WhyJoin() {
  return (
    <section className="bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-purple-600">
            Why join RawEval
          </p>
          <h2 className="text-foreground mb-4 text-3xl font-semibold md:text-4xl">
            Turn your expertise into income
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            You already know how to make AI outputs better. We connect that
            skill with companies willing to pay for quality human feedback.
          </p>
        </div>

        {/* Main reasons grid */}
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {reasons.map((reason) => {
            const colors = colorMap[reason.color] ?? colorMap.blue!;
            return (
              <div
                key={reason.title}
                className="border-border card-hover rounded-2xl border bg-white p-6"
              >
                <div
                  className={`h-12 w-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text} mb-4`}
                >
                  {reason.icon}
                </div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">
                  {reason.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Benefits list */}
        <div className="border-border rounded-2xl border bg-white p-8">
          <h3 className="text-foreground mb-6 text-center text-xl font-semibold">
            What you get
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The problem you solve */}
        <div className="mt-16 rounded-2xl bg-slate-900 p-8 text-white">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-2xl font-semibold">
                The problem you're solving
              </h3>
              <p className="mb-6 leading-relaxed text-slate-300">
                AI models are trained on internet data — much of it low quality
                or AI-generated. When you correct an AI response, you create{' '}
                <span className="font-medium text-emerald-400">
                  "clean" human data
                </span>{' '}
                that's increasingly rare and valuable.
              </p>
              <p className="leading-relaxed text-slate-300">
                Companies like Meta, Google, and OpenAI need this data to
                improve their models. Your corrections help them distinguish
                good answers from bad ones, making AI more accurate for
                everyone.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
                    <span className="text-lg text-red-400">✗</span>
                  </div>
                  <span className="font-medium">Before your correction</span>
                </div>
                <p className="pl-11 text-sm text-slate-400">
                  Generic response with factual errors
                </p>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-slate-600" />
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                    <span className="text-lg text-emerald-400">✓</span>
                  </div>
                  <span className="font-medium text-emerald-400">
                    After your correction
                  </span>
                </div>
                <p className="pl-11 text-sm text-slate-400">
                  Accurate, well-reasoned answer → Gold training data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
