'use client';

import { useState } from 'react';
import Link from 'next/link';
import { appUrls } from '@raweval/utils/urls';
import {
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Database,
  Send,
  Award,
  BarChart3,
  FileJson,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Activity,
  Zap,
  Users,
} from 'lucide-react';

// Tier comparison data
const tierComparison = {
  tier1: {
    label: 'Tier 1',
    sublabel: 'Gold Standard',
    color: '#f59e0b',
    accuracy: 96.8,
    consistency: 98.2,
    completeness: 97.5,
    avgTime: '12.4min',
    samples: 1247,
  },
  tier2: {
    label: 'Tier 2',
    sublabel: 'Verified',
    color: '#3b82f6',
    accuracy: 89.3,
    consistency: 91.7,
    completeness: 88.9,
    avgTime: '9.2min',
    samples: 3891,
  },
  tier3: {
    label: 'Tier 3',
    sublabel: 'Standard',
    color: '#64748b',
    accuracy: 82.1,
    consistency: 84.6,
    completeness: 79.8,
    avgTime: '7.8min',
    samples: 8234,
  },
};

// Delta metrics
const deltaMetrics = [
  {
    label: 'Accuracy Lift',
    value: '+14.7%',
    baseline: '82.1%',
    improved: '96.8%',
    description: 'vs model baseline',
  },
  {
    label: 'Error Reduction',
    value: '-67%',
    baseline: '12.3%',
    improved: '4.1%',
    description: 'false positives',
  },
  {
    label: 'Coverage',
    value: '+23%',
    baseline: '71%',
    improved: '94%',
    description: 'edge cases handled',
  },
  {
    label: 'Consistency',
    value: '+16.2%',
    baseline: '82%',
    improved: '98.2%',
    description: 'inter-annotator agreement',
  },
];

// API endpoint preview
const apiResponse = `{
  "dataset_id": "gold_2024_q4_batch_847",
  "version": "1.0.3",
  "metrics": {
    "total_samples": 12847,
    "accuracy": 0.968,
    "iou_mean": 0.912,
    "validated_by": "tier_1_experts"
  },
  "delivery": {
    "format": "jsonl",
    "compression": "gzip",
    "checksum": "sha256:7f3a...c9d2"
  }
}`;

// Comparison bar component
function ComparisonBar({
  label,
  tier1Value,
  tier2Value,
  tier3Value,
  unit = '%',
}: {
  label: string;
  tier1Value: number;
  tier2Value: number;
  tier3Value: number;
  unit?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
      </div>
      <div className="space-y-1.5">
        {/* Tier 1 */}
        <div className="flex items-center gap-3">
          <span className="w-10 text-[10px] font-medium text-amber-600">
            T1
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${tier1Value}%` }}
            />
          </div>
          <span className="font-metric w-14 text-right text-xs text-slate-700">
            {tier1Value}
            {unit}
          </span>
        </div>
        {/* Tier 2 */}
        <div className="flex items-center gap-3">
          <span className="w-10 text-[10px] font-medium text-blue-600">T2</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${tier2Value}%` }}
            />
          </div>
          <span className="font-metric w-14 text-right text-xs text-slate-700">
            {tier2Value}
            {unit}
          </span>
        </div>
        {/* Tier 3 */}
        <div className="flex items-center gap-3">
          <span className="w-10 text-[10px] font-medium text-slate-500">
            T3
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-400 transition-all duration-500"
              style={{ width: `${tier3Value}%` }}
            />
          </div>
          <span className="font-metric w-14 text-right text-xs text-slate-700">
            {tier3Value}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

// Delta metric card
function DeltaCard({ metric }: { metric: (typeof deltaMetrics)[0] }) {
  const isPositive = metric.value.startsWith('+');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-sm text-slate-500">{metric.label}</span>
        <TrendingUp
          className={`h-4 w-4 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}
        />
      </div>
      <div
        className={`mb-1 text-3xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}
      >
        {metric.value}
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-metric">{metric.baseline}</span>
        <ArrowRight className="h-3 w-3" />
        <span className="font-metric text-slate-600">{metric.improved}</span>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">{metric.description}</p>
    </div>
  );
}

// API code block
function APICodeBlock() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">
            GET /v1/datasets/latest
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Code */}
      <div className="font-metric overflow-x-auto bg-slate-900 p-4 text-xs leading-relaxed">
        <pre className="text-slate-300">
          <code>{apiResponse}</code>
        </pre>
      </div>
    </div>
  );
}

// Enterprise dashboard preview
function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
            <Lock className="h-3 w-3" />
            dashboard.raweval.ai/enterprise
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Meta AI Team
              </div>
              <div className="text-[10px] text-slate-500">
                Enterprise License • Active
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-600">
              Connected
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-4 grid grid-cols-4 gap-3">
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <div className="text-lg font-bold text-slate-900">2.4M</div>
            <div className="text-[10px] text-slate-500">Samples Delivered</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <div className="text-lg font-bold text-emerald-600">96.8%</div>
            <div className="text-[10px] text-slate-500">Avg Accuracy</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <div className="text-lg font-bold text-slate-900">847</div>
            <div className="text-[10px] text-slate-500">Active Batches</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <div className="text-lg font-bold text-blue-600">$1.2M</div>
            <div className="text-[10px] text-slate-500">Data Value</div>
          </div>
        </div>

        {/* Recent deliveries */}
        <div className="mb-2 text-[10px] tracking-wider text-slate-500 uppercase">
          Recent Deliveries
        </div>
        <div className="space-y-2">
          {[
            {
              id: 'batch_847',
              samples: '12,847',
              time: '2 min ago',
              status: 'delivered',
            },
            {
              id: 'batch_846',
              samples: '15,203',
              time: '1 hour ago',
              status: 'delivered',
            },
            {
              id: 'batch_845',
              samples: '9,891',
              time: '3 hours ago',
              status: 'delivered',
            },
          ].map((batch) => (
            <div
              key={batch.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 p-2"
            >
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-metric text-xs text-slate-700">
                  {batch.id}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {batch.samples} samples
              </span>
              <span className="text-[10px] text-slate-400">{batch.time}</span>
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-[10px]">{batch.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ValidationDelivery() {
  return (
    <section className="bg-slate-50 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-100 px-3 py-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">
                Validation & Delivery
              </span>
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            Gold Standard Output
          </h2>
          <p className="text-lg text-slate-600">
            Tier 1 experts validate all outputs. Enterprise clients receive
            verified, production-ready data via secure API.
          </p>
        </div>

        {/* Main content grid */}
        <div className="mb-16 grid gap-8 lg:grid-cols-2">
          {/* Left: Tier comparison */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-400" />
              <h3 className="font-semibold text-slate-900">
                Tier Performance Comparison
              </h3>
            </div>

            {/* Tier legend */}
            <div className="mb-6 flex items-center gap-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-amber-500" />
                <span className="text-xs text-slate-600">
                  Tier 1 • Gold Standard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-blue-500" />
                <span className="text-xs text-slate-600">
                  Tier 2 • Verified
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-slate-400" />
                <span className="text-xs text-slate-600">
                  Tier 3 • Standard
                </span>
              </div>
            </div>

            {/* Comparison bars */}
            <div className="space-y-6">
              <ComparisonBar
                label="Accuracy Score"
                tier1Value={tierComparison.tier1.accuracy}
                tier2Value={tierComparison.tier2.accuracy}
                tier3Value={tierComparison.tier3.accuracy}
              />
              <ComparisonBar
                label="Consistency"
                tier1Value={tierComparison.tier1.consistency}
                tier2Value={tierComparison.tier2.consistency}
                tier3Value={tierComparison.tier3.consistency}
              />
              <ComparisonBar
                label="Completeness"
                tier1Value={tierComparison.tier1.completeness}
                tier2Value={tierComparison.tier2.completeness}
                tier3Value={tierComparison.tier3.completeness}
              />
            </div>

            {/* Sample counts */}
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              <div className="text-center">
                <div className="text-xl font-bold text-amber-600">
                  {tierComparison.tier1.samples.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">T1 Samples</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {tierComparison.tier2.samples.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">T2 Samples</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-600">
                  {tierComparison.tier3.samples.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">T3 Samples</div>
              </div>
            </div>
          </div>

          {/* Right: Delta metrics */}
          <div>
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-900">
                Delta Improvement
              </h3>
              <span className="ml-auto text-xs text-slate-400">
                vs. baseline model output
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {deltaMetrics.map((metric) => (
                <DeltaCard key={metric.label} metric={metric} />
              ))}
            </div>
          </div>
        </div>

        {/* API & Dashboard section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* API Delivery */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900">API Delivery</h3>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Production-ready datasets delivered via secure REST API with full
              provenance metadata.
            </p>
            <APICodeBlock />

            {/* API features */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <Lock className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-600">TLS 1.3</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <Zap className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-600">&lt;50ms latency</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <Activity className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-600">99.99% uptime</span>
              </div>
            </div>
          </div>

          {/* Enterprise Dashboard */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-slate-900">
                  Enterprise Dashboard
                </h3>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700">
                <span>View demo</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Real-time visibility into data quality, delivery status, and usage
              metrics.
            </p>
            <DashboardPreview />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl bg-slate-900 p-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Award className="h-6 w-6 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">
              Enterprise Ready
            </span>
          </div>
          <h3 className="mb-2 text-2xl font-bold text-white">
            Ready to access Gold Standard data?
          </h3>
          <p className="mx-auto mb-6 max-w-lg text-slate-400">
            Join Meta, OpenAI, and leading AI labs using RawEval for production
            training data.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={appUrls.landing('/research')}
              className="rounded-lg bg-white px-6 py-3 font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Request API Access
            </Link>
            <Link
              href={appUrls.landing('/#how-it-works')}
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-700"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
