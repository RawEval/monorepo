'use client';

import {
  Eye,
  Fingerprint,
  LineChart,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Tiered Expert Network',
    description:
      'Every expert undergoes a 30-minute deep-dive interview with live screen sharing. Only verified domain experts reach Tier 1.',
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: '60-Second Heartbeat',
    description:
      'Continuous verification every minute. If an expert leaves frame or a phone is detected, the session locks instantly.',
  },
  {
    icon: <Fingerprint className="h-5 w-5" />,
    title: 'Identity Verification',
    description:
      'Biometric face detection with deepfake screening. Each session is tied to a verified identity—no anonymous submissions.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Anti-AI Filtering',
    description:
      'Keystroke rhythm analysis detects LLM-generated or copy-pasted content. Suspicious submissions are voided automatically.',
  },
  {
    icon: <LineChart className="h-5 w-5" />,
    title: 'Gold Standard Comparison',
    description:
      'Every submission is instantly compared against Tier 1 expert answers. You receive only verified improvements.',
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: 'Privacy-First Pipeline',
    description:
      "Automatic PII removal from all captured prompts. Your users' data never reaches the training set.",
  },
];

export function PlatformSection() {
  return (
    <section id="platform" className="bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-blue-600">Platform</p>
          <h2 className="text-foreground mb-4 text-3xl font-semibold md:text-4xl">
            Human verification you can trust
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Every data point is verified by domain experts under continuous
            monitoring. No synthetic data. No AI contamination.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border-border card-hover rounded-xl border bg-white p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-foreground mb-2 font-semibold">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
