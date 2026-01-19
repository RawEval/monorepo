'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { StatsCard } from '@raweval/ui/stats-card';
import { FeatureCard } from '@raweval/ui/feature-card';
import { SectionHeader } from '@raweval/ui/section-header';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import {
  Shield,
  DollarSign,
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  Briefcase,
} from 'lucide-react';

export default function ExpertsLandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
        
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23ffffff'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Hero content */}
          <div className={`mx-auto mb-16 max-w-4xl text-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Award className="h-4 w-4" />
              <span>Expert Workbench</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Turn Your Expertise
              <br />
              Into Income
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-blue-100 md:text-xl">
              Review and correct AI responses as a domain expert. Earn $2-15 per
              prompt with flexible hours and a secure, monitored workbench.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 bg-white px-8 text-blue-600 hover:bg-blue-50"
                asChild
              >
                <Link href="/workbench">
                  Access Workbench
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-white px-8 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/register">Register as Expert</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className={`mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4 ${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
            <StatsCard value="2,400+" label="Active Experts" className="text-white" />
            <StatsCard value="$680K+" label="Paid Out (YTD)" className="text-white" />
            <StatsCard value="47K+" label="Prompts Reviewed" className="text-white" />
            <StatsCard value="96.8%" label="Avg Accuracy" className="text-white" />
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Why Join RawEval Experts?"
            description="Flexible work, competitive pay, and the opportunity to shape the
              future of AI."
            className="mb-16"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<DollarSign className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Competitive Pay"
              description="Earn $2-15 per prompt based on complexity and your tier. Tier 1
                experts earn $15-25 per task."
            />

            <FeatureCard
              icon={<Clock className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Flexible Hours"
              description="Work on your schedule. Accept tasks when available, complete them
                at your pace."
            />

            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Tier Progression"
              description="Advance through tiers by maintaining high accuracy. Higher tiers
                unlock better pay and priority tasks."
            />

            <FeatureCard
              icon={<Shield className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Secure Workbench"
              description="Biometric verification, camera monitoring, and secure environment
                ensure quality and prevent fraud."
            />

            <FeatureCard
              icon={<Target className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Meaningful Work"
              description="Help improve AI for everyone. Your corrections train better models
                used by thousands."
            />

            <FeatureCard
              icon={<Zap className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Fast Payouts"
              description="Get paid quickly through multiple payment methods. Bank transfers,
                cards, and digital wallets supported."
            />
          </div>
        </div>
      </section>

      {/* Tier System */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Three-Tier Expert System"
            description="Start at Tier 3 and advance based on performance and accuracy."
            className="mb-16"
          />

          <div className="grid gap-8 md:grid-cols-3">
            {/* Tier 1 */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 p-8 shadow-xl text-white">
              <div className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                Premium
              </div>
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-6 w-6" />
                <h3 className="text-2xl font-bold">Tier 1</h3>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold">$15-25</div>
                <div className="text-sm text-blue-100">per task</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                  <span className="text-sm text-blue-50">98%+ accuracy required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                  <span className="text-sm text-blue-50">Priority task access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                  <span className="text-sm text-blue-50">Complex/high-value tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                  <span className="text-sm text-blue-50">Direct support access</span>
                </li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="border-border rounded-2xl border bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-blue-600" />
                <h3 className="text-2xl font-bold">Tier 2</h3>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600">$8-12</div>
                <div className="text-sm text-muted-foreground">per task</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <span className="text-sm">95%+ accuracy required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <span className="text-sm">Standard task access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <span className="text-sm">Medium complexity tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <span className="text-sm">Community support</span>
                </li>
              </ul>
            </div>

            {/* Tier 3 */}
            <div className="border-border rounded-2xl border bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-slate-600" />
                <h3 className="text-2xl font-bold">Tier 3</h3>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-slate-600">$2-8</div>
                <div className="text-sm text-muted-foreground">per task</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <span className="text-sm">90%+ accuracy required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <span className="text-sm">Entry-level tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <span className="text-sm">Simple/straightforward tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <span className="text-sm">Self-service resources</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="How the Workbench Works"
            description="Simple process, maximum flexibility. Start earning from day one."
            className="mb-16"
          />

          <div className="grid gap-12 md:grid-cols-3">
            <div className="relative">
              <div className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                1
              </div>
              <div className="border-border rounded-2xl border bg-slate-50 p-8 pt-12">
                <Briefcase className="mb-4 h-8 w-8 text-blue-600" />
                <h3 className="mb-2 text-xl font-semibold">Browse Available Tasks</h3>
                <p className="text-muted-foreground text-sm">
                  View available prompts in your domain. Filter by complexity, reward,
                  and time commitment.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                2
              </div>
              <div className="border-border rounded-2xl border bg-slate-50 p-8 pt-12">
                <Shield className="mb-4 h-8 w-8 text-blue-600" />
                <h3 className="mb-2 text-xl font-semibold">Secure Session Starts</h3>
                <p className="text-muted-foreground text-sm">
                  Camera monitoring and biometric verification ensure quality and
                  prevent fraud. Complete the task at your pace.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                3
              </div>
              <div className="border-border rounded-2xl border bg-slate-50 p-8 pt-12">
                <DollarSign className="mb-4 h-8 w-8 text-blue-600" />
                <h3 className="mb-2 text-xl font-semibold">Get Paid</h3>
                <p className="text-muted-foreground text-sm">
                  Receive payment within 24-48 hours. Withdraw via bank transfer, PayPal,
                  or digital wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-24 text-white lg:py-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23ffffff'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Start Earning?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
              Join thousands of experts helping improve AI while earning competitive
              pay. Get started in minutes.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 bg-white px-8 text-blue-600 hover:bg-blue-50"
                asChild
              >
                <Link href="/register">
                  Register as Expert
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white px-8 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/workbench">Access Workbench</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
