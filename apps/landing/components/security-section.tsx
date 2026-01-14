'use client';

import { Shield, CheckCircle2 } from 'lucide-react';

const securityFeatures = [
  'SOC 2 Type II compliant infrastructure',
  'End-to-end encryption for all data',
  'Biometric verification at every session',
  'Automatic PII de-identification',
  'Real-time deepfake detection',
  'Keystroke pattern analysis',
];

export function SecuritySection() {
  return (
    <section
      id="security"
      className="bg-primary text-primary-foreground py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Content */}
          <div>
            <p className="mb-3 text-sm font-medium text-blue-300">Security</p>
            <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
              Secure by default
            </h2>
            <p className="mb-8 text-lg text-slate-300">
              RawEval is built with security at its core. Every piece of data is
              verified, every expert is authenticated, and every session is
              monitored.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {securityFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <span className="text-sm text-slate-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Badge */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="flex h-48 w-48 flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <Shield className="mb-4 h-16 w-16 text-emerald-400" />
                <p className="text-center text-sm font-medium">SOC 2 Type II</p>
                <p className="mt-1 text-center text-xs text-slate-400">
                  Certified
                </p>
              </div>
              {/* Decorative rings */}
              <div className="absolute inset-0 -m-4 rounded-3xl border border-white/5" />
              <div className="absolute inset-0 -m-8 rounded-3xl border border-white/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
