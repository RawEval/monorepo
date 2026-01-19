import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@raweval/ui/button';
import { StatsCard } from '@raweval/ui/stats-card';
import { FeatureCard } from '@raweval/ui/feature-card';
import { SectionHeader } from '@raweval/ui/section-header';
import {
  Shield,
  BarChart3,
  Users,
  FileText,
  ArrowRight,
  Activity,
  DollarSign,
  Target,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | RawEval',
  description:
    'Internal admin dashboard for managing experts, prompts, tasks, and organizations. Real-time monitoring and analytics.',
};

export default function AdminLandingPage() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 via-white to-white pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700">
              <Shield className="h-4 w-4" />
              <span>Internal Only</span>
            </div>
            <h1 className="text-foreground mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-lg md:text-xl">
              Manage experts, monitor tasks, track performance, and oversee the
              entire RawEval platform from one centralized dashboard.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href="/dashboard">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
            <StatsCard value="1,247" label="Total Experts" />
            <StatsCard value="45,782" label="Total Prompts" />
            <StatsCard value="$247K+" label="Revenue" />
            <StatsCard value="97.2%" label="Avg Accuracy" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            title="Complete Platform Management"
            description="Everything you need to monitor and manage the RawEval platform."
            className="mb-16"
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Expert Management"
              description="View all experts, manage tiers, verify certifications, and track
                performance metrics."
            />

            <FeatureCard
              icon={<FileText className="h-6 w-6 text-green-600" />}
              iconBg="bg-green-100"
              title="Prompt & Task Tracking"
              description="Monitor all prompts, track task status, view failed prompts, and
                manage workbench batches."
            />

            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
              iconBg="bg-purple-100"
              title="Analytics & Reports"
              description="Real-time statistics, revenue tracking, accuracy metrics, and
                performance dashboards."
            />

            <FeatureCard
              icon={<Activity className="h-6 w-6 text-orange-600" />}
              iconBg="bg-orange-100"
              title="Live Monitoring"
              description="Real-time task status, expert activity, system health, and
                performance alerts."
            />

            <FeatureCard
              icon={<DollarSign className="h-6 w-6 text-indigo-600" />}
              iconBg="bg-indigo-100"
              title="Payment Management"
              description="Track payments, view statistics, manage payment methods, and
                process payouts."
            />

            <FeatureCard
              icon={<Target className="h-6 w-6 text-red-600" />}
              iconBg="bg-red-100"
              title="Quality Control"
              description="Review expert submissions, verify accuracy, manage tier
                promotions, and ensure quality."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-24 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Access the Dashboard?
            </h2>
            <p className="mb-8 text-lg text-slate-300">
              This is an internal-only dashboard. Ensure you have proper
              authentication and permissions.
            </p>
            <Button
              size="lg"
              className="h-12 bg-white px-8 text-slate-900 hover:bg-slate-100"
              asChild
            >
              <Link href="/dashboard">
                Access Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
