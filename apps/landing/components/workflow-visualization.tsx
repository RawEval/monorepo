'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Circle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowDown,
  Search,
  UserCheck,
  Shield,
  Database,
  Zap,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Lock,
  Unlock,
  Activity,
  Timer,
  GitBranch,
  Box,
} from 'lucide-react';

// Color system
const STATUS_COLORS = {
  gold: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-700',
    label: 'Gold Standard',
  },
  buffer: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-700',
    label: 'Evaluation Buffer',
  },
  failed: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-700',
    label: 'Failed',
  },
  locked: {
    bg: 'bg-red-600',
    bgLight: 'bg-red-100',
    border: 'border-red-600',
    text: 'text-red-800',
    label: 'Locked',
  },
  active: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-700',
    label: 'Active',
  },
  pending: {
    bg: 'bg-slate-400',
    bgLight: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-600',
    label: 'Pending',
  },
};

// Latency badge component
function LatencyBadge({
  ms,
  status = 'normal',
}: {
  ms: number;
  status?: 'fast' | 'normal' | 'slow';
}) {
  const colors = {
    fast: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    normal: 'bg-slate-100 text-slate-700 border-slate-200',
    slow: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <span
      className={`font-metric inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${colors[status]}`}
    >
      <Timer className="h-2.5 w-2.5" />
      {ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`}
    </span>
  );
}

// Status indicator dot
function StatusDot({ status }: { status: keyof typeof STATUS_COLORS }) {
  const color = STATUS_COLORS[status];
  return (
    <span className={`relative flex h-2.5 w-2.5`}>
      {(status === 'active' || status === 'buffer') && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color.bg} opacity-75`}
        />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color.bg}`}
      />
    </span>
  );
}

// Workflow state node
function WorkflowNode({
  id,
  label,
  status,
  latency,
  isStart,
  isEnd,
}: {
  id: string;
  label: string;
  status: keyof typeof STATUS_COLORS;
  latency?: number;
  isStart?: boolean;
  isEnd?: boolean;
}) {
  const color = STATUS_COLORS[status];

  return (
    <div
      className={`relative flex items-center gap-2 rounded-lg border-2 bg-white px-3 py-2 ${color.border} ${color.bgLight} transition-all duration-200 hover:shadow-md`}
    >
      {isStart && (
        <div className="absolute top-1/2 -left-6 -translate-y-1/2">
          <Play className="h-4 w-4 fill-slate-400 text-slate-400" />
        </div>
      )}
      <StatusDot status={status} />
      <span className="text-xs font-medium text-slate-700">{label}</span>
      {latency && (
        <LatencyBadge
          ms={latency}
          status={latency < 50 ? 'fast' : latency > 500 ? 'slow' : 'normal'}
        />
      )}
      {isEnd && (
        <div className="absolute top-1/2 -right-6 -translate-y-1/2">
          <Box className="h-4 w-4 text-slate-400" />
        </div>
      )}
    </div>
  );
}

// Execution step in accordion
interface ExecutionStep {
  id: string;
  name: string;
  status: keyof typeof STATUS_COLORS;
  latency: number;
  details?: string;
  children?: ExecutionStep[];
}

function ExecutionStepRow({
  step,
  depth = 0,
}: {
  step: ExecutionStep;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(
    step.status === 'active' || step.status === 'buffer'
  );
  const hasChildren = step.children && step.children.length > 0;
  const color = STATUS_COLORS[step.status];

  return (
    <div
      className={`${depth > 0 ? 'ml-4 border-l-2 border-slate-200 pl-3' : ''}`}
    >
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 ${hasChildren ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'} transition-colors`}
      >
        {/* Expand icon */}
        <div className="flex h-4 w-4 items-center justify-center">
          {hasChildren ? (
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? '' : '-rotate-90'}`}
            />
          ) : (
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          )}
        </div>

        {/* Status icon */}
        <div
          className={`flex h-5 w-5 items-center justify-center rounded ${color.bgLight}`}
        >
          {step.status === 'gold' && (
            <CheckCircle2 className={`h-3.5 w-3.5 ${color.text}`} />
          )}
          {step.status === 'buffer' && (
            <Clock className={`h-3.5 w-3.5 ${color.text}`} />
          )}
          {step.status === 'failed' && (
            <XCircle className={`h-3.5 w-3.5 ${color.text}`} />
          )}
          {step.status === 'locked' && (
            <Lock className={`h-3.5 w-3.5 ${color.text}`} />
          )}
          {step.status === 'active' && (
            <Activity className={`h-3.5 w-3.5 ${color.text}`} />
          )}
          {step.status === 'pending' && (
            <Circle className={`h-3.5 w-3.5 ${color.text}`} />
          )}
        </div>

        {/* Step name */}
        <span className="flex-1 text-left text-sm text-slate-700">
          {step.name}
        </span>

        {/* Status badge */}
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-medium ${color.bgLight} ${color.text}`}
        >
          {color.label}
        </span>

        {/* Latency */}
        <LatencyBadge
          ms={step.latency}
          status={
            step.latency < 50 ? 'fast' : step.latency > 500 ? 'slow' : 'normal'
          }
        />
      </button>

      {/* Details */}
      {step.details && (
        <div className="font-metric mb-2 ml-11 text-xs text-slate-500">
          {step.details}
        </div>
      )}

      {/* Children */}
      {expanded && hasChildren && (
        <div className="mt-1">
          {step.children!.map((child) => (
            <ExecutionStepRow key={child.id} step={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Phase accordion
interface PhaseAccordion {
  id: string;
  phase: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: keyof typeof STATUS_COLORS;
  totalLatency: number;
  steps: ExecutionStep[];
  stateGraph: Array<{
    id: string;
    label: string;
    status: keyof typeof STATUS_COLORS;
    latency?: number;
  }>;
}

const phases: PhaseAccordion[] = [
  {
    id: 'ingestion',
    phase: 1,
    title: 'Ingestion',
    subtitle: 'Search World → Evaluation Buffer',
    icon: <Search className="h-5 w-5" />,
    status: 'gold',
    totalLatency: 47,
    stateGraph: [
      { id: 'input', label: 'User Query', status: 'gold', latency: 2 },
      { id: 'shadow', label: 'Shadow Execute', status: 'gold', latency: 15 },
      { id: 'pathA', label: 'Path A: Response', status: 'gold', latency: 20 },
      { id: 'pathB', label: 'Path B: Buffer', status: 'buffer', latency: 10 },
    ],
    steps: [
      {
        id: 's1',
        name: 'Shadow Execution Trigger',
        status: 'gold',
        latency: 2,
        details: "workflow.signal('shadow_trigger', { prompt_id: '0x7f3a' })",
        children: [
          { id: 's1a', name: 'Parse user input', status: 'gold', latency: 1 },
          {
            id: 's1b',
            name: 'Generate session context',
            status: 'gold',
            latency: 1,
          },
        ],
      },
      {
        id: 's2',
        name: 'Dual Path Execution',
        status: 'gold',
        latency: 35,
        children: [
          {
            id: 's2a',
            name: 'Path A: LLM + Web Search',
            status: 'gold',
            latency: 20,
            details: 'Response delivered to user',
          },
          {
            id: 's2b',
            name: 'Path B: Evaluation Buffer Push',
            status: 'buffer',
            latency: 10,
            details: 'Queued for expert review',
          },
        ],
      },
      {
        id: 's3',
        name: 'Failure Detection',
        status: 'gold',
        latency: 10,
        details: "Monitoring: edit_time > 10s || user_click('Wrong')",
        children: [
          { id: 's3a', name: 'Edit time monitor', status: 'gold', latency: 5 },
          { id: 's3b', name: 'Feedback listener', status: 'gold', latency: 5 },
        ],
      },
    ],
  },
  {
    id: 'gauntlet',
    phase: 2,
    title: 'The Gauntlet',
    subtitle: 'Expert Vetting → Tier Assignment',
    icon: <UserCheck className="h-5 w-5" />,
    status: 'gold',
    totalLatency: 1680000,
    stateGraph: [
      { id: 'apply', label: 'Application', status: 'gold', latency: 120000 },
      {
        id: 'interview',
        label: 'Oracle Interview',
        status: 'gold',
        latency: 1440000,
      },
      { id: 'score', label: 'WoE Scoring', status: 'gold', latency: 60000 },
      { id: 'tier', label: 'Tier Assign', status: 'gold', latency: 60000 },
    ],
    steps: [
      {
        id: 'g1',
        name: '8-Phase Oracle Interview',
        status: 'gold',
        latency: 1440000,
        details: "langgraph.invoke('oracle_interview', expert_id)",
        children: [
          {
            id: 'g1a',
            name: 'Phase 1-2: Identity Verification',
            status: 'gold',
            latency: 180000,
          },
          {
            id: 'g1b',
            name: 'Phase 3-4: Domain Assessment',
            status: 'gold',
            latency: 360000,
          },
          {
            id: 'g1c',
            name: 'Phase 5-6: Practical Evaluation',
            status: 'gold',
            latency: 540000,
          },
          {
            id: 'g1d',
            name: 'Phase 7-8: Security Protocol',
            status: 'gold',
            latency: 360000,
          },
        ],
      },
      {
        id: 'g2',
        name: 'Biometric Verification',
        status: 'gold',
        latency: 120000,
        children: [
          {
            id: 'g2a',
            name: 'Face detection & verification',
            status: 'gold',
            latency: 50,
          },
          {
            id: 'g2b',
            name: 'Deepfake analysis',
            status: 'gold',
            latency: 2000,
          },
          {
            id: 'g2c',
            name: 'Identity hash match',
            status: 'gold',
            latency: 500,
          },
        ],
      },
      {
        id: 'g3',
        name: 'WoE Score Calculation',
        status: 'gold',
        latency: 60000,
        details: 'Score: 0.847 → Tier 1 Assignment',
      },
    ],
  },
  {
    id: 'workbench',
    phase: 3,
    title: 'The Work',
    subtitle: '3-3-3 Workbench → Iron Dome',
    icon: <Shield className="h-5 w-5" />,
    status: 'active',
    totalLatency: 423000,
    stateGraph: [
      { id: 'alloc', label: 'Task Allocation', status: 'gold', latency: 5000 },
      { id: 'dome', label: 'Iron Dome', status: 'active' },
      { id: 'heartbeat', label: 'Heartbeat', status: 'active' },
      { id: 'submit', label: 'Submission', status: 'pending' },
    ],
    steps: [
      {
        id: 'w1',
        name: 'Batch Allocation',
        status: 'gold',
        latency: 5000,
        details: '10 prompts → 9 experts (3×T1, 3×T2, 3×T3)',
        children: [
          {
            id: 'w1a',
            name: 'Pull from High-Priority Queue',
            status: 'gold',
            latency: 100,
          },
          {
            id: 'w1b',
            name: 'Expert availability check',
            status: 'gold',
            latency: 2000,
          },
          {
            id: 'w1c',
            name: 'Task distribution',
            status: 'gold',
            latency: 2900,
          },
        ],
      },
      {
        id: 'w2',
        name: 'Iron Dome Security Layer',
        status: 'active',
        latency: 0,
        children: [
          {
            id: 'w2a',
            name: 'Camera stream active',
            status: 'active',
            latency: 0,
            details: "MediaStreamTrack.readyState: 'live'",
          },
          {
            id: 'w2b',
            name: 'Screen share active',
            status: 'active',
            latency: 0,
          },
          { id: 'w2c', name: 'Face count: 1 ✓', status: 'gold', latency: 45 },
          {
            id: 'w2d',
            name: 'Phone detection: None ✓',
            status: 'gold',
            latency: 32,
          },
        ],
      },
      {
        id: 'w3',
        name: '60s Heartbeat Loop',
        status: 'active',
        latency: 0,
        details: 'Next check in 34s...',
        children: [
          { id: 'w3a', name: 'Frame capture', status: 'active', latency: 0 },
          {
            id: 'w3b',
            name: 'Local TF.js analysis',
            status: 'pending',
            latency: 0,
          },
          {
            id: 'w3c',
            name: 'Backend verification',
            status: 'pending',
            latency: 0,
          },
        ],
      },
      {
        id: 'w4',
        name: 'Anti-AI Filter',
        status: 'active',
        latency: 0,
        children: [
          {
            id: 'w4a',
            name: 'Keystroke rhythm analysis',
            status: 'active',
            latency: 0,
            details: 'Pattern: ORGANIC',
          },
          {
            id: 'w4b',
            name: 'Copy-paste detector',
            status: 'gold',
            latency: 5,
            details: '0 violations',
          },
        ],
      },
      {
        id: 'w5',
        name: 'Expert #847 Session',
        status: 'locked',
        latency: 180000,
        details: 'VIOLATION: Face disappeared at 03:24',
        children: [
          {
            id: 'w5a',
            name: 'UI_OVERLAY_LOCK triggered',
            status: 'locked',
            latency: 12,
          },
          { id: 'w5b', name: 'Task retracted', status: 'failed', latency: 100 },
          {
            id: 'w5c',
            name: 'Auto-reassign to available expert',
            status: 'buffer',
            latency: 3000,
          },
        ],
      },
    ],
  },
  {
    id: 'validation',
    phase: 4,
    title: 'Validation & Sale',
    subtitle: 'Gold Dataset → Enterprise API',
    icon: <Database className="h-5 w-5" />,
    status: 'pending',
    totalLatency: 0,
    stateGraph: [
      { id: 'qc', label: 'Auto-QC', status: 'pending' },
      { id: 'delta', label: 'Delta Metric', status: 'pending' },
      { id: 'package', label: 'Package', status: 'pending' },
      { id: 'deliver', label: 'API Deliver', status: 'pending' },
    ],
    steps: [
      {
        id: 'v1',
        name: 'Auto-QC Against Tier 1',
        status: 'pending',
        latency: 0,
        children: [
          {
            id: 'v1a',
            name: 'Vector similarity check',
            status: 'pending',
            latency: 0,
          },
          {
            id: 'v1b',
            name: 'Rubric compliance check',
            status: 'pending',
            latency: 0,
          },
        ],
      },
      {
        id: 'v2',
        name: 'Delta Metric Calculation',
        status: 'pending',
        latency: 0,
        details: 'Measure accuracy lift vs. original model',
      },
      {
        id: 'v3',
        name: 'Enterprise Package',
        status: 'pending',
        latency: 0,
        children: [
          {
            id: 'v3a',
            name: 'Format for training',
            status: 'pending',
            latency: 0,
          },
          {
            id: 'v3b',
            name: 'Attach provenance metadata',
            status: 'pending',
            latency: 0,
          },
        ],
      },
      {
        id: 'v4',
        name: 'API Delivery',
        status: 'pending',
        latency: 0,
        details: 'POST /v1/gold-dataset → Meta Llama Team',
      },
    ],
  },
];

function PhaseAccordionCard({ phase }: { phase: PhaseAccordion }) {
  const [expanded, setExpanded] = useState(phase.status === 'active');
  const color = STATUS_COLORS[phase.status];

  return (
    <div
      className={`overflow-hidden rounded-xl border-2 bg-white transition-all duration-300 ${expanded ? `${color.border} shadow-lg` : 'border-slate-200 hover:border-slate-300'} `}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-slate-50/50"
      >
        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform ${expanded ? '' : '-rotate-90'}`}
        />

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.bgLight} ${color.text}`}
        >
          {phase.icon}
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${color.text}`}>
              PHASE {phase.phase}
            </span>
            <StatusDot status={phase.status} />
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-medium ${color.bgLight} ${color.text}`}
            >
              {color.label}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900">{phase.title}</h3>
          <p className="text-xs text-slate-500">{phase.subtitle}</p>
        </div>

        <div className="text-right">
          <LatencyBadge
            ms={phase.totalLatency}
            status={
              phase.totalLatency === 0
                ? 'normal'
                : phase.totalLatency < 100
                  ? 'fast'
                  : 'normal'
            }
          />
          <p className="mt-1 text-[10px] text-slate-400">Total Latency</p>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100">
          {/* State graph visualization */}
          <div className="border-b border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                State Graph
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {phase.stateGraph.map((node, index) => (
                <div key={node.id} className="flex items-center gap-2">
                  <WorkflowNode
                    id={node.id}
                    label={node.label}
                    status={node.status}
                    latency={node.latency}
                    isStart={index === 0}
                    isEnd={index === phase.stateGraph.length - 1}
                  />
                  {index < phase.stateGraph.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Execution steps accordion */}
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Execution Log
              </span>
            </div>
            <div className="space-y-1">
              {phase.steps.map((step) => (
                <ExecutionStepRow key={step.id} step={step} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowVisualization() {
  return (
    <section id="workflow" className="bg-slate-50 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-metric text-xs text-slate-300">
                WORKFLOW ENGINE
              </span>
            </div>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="font-metric text-xs text-slate-400">
                run_id:
              </span>
              <code className="font-metric rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                wf_0x7f3ac9d2
              </code>
            </div>
          </div>
          <h2 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">
            The Life of a Prompt
          </h2>
          <p className="text-lg text-slate-600">
            Real-time workflow execution from query to gold-standard output
          </p>
        </div>

        {/* Color legend */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Status Legend:
          </span>
          {[
            {
              status: 'gold' as const,
              icon: <CheckCircle2 className="h-3.5 w-3.5" />,
            },
            {
              status: 'buffer' as const,
              icon: <Clock className="h-3.5 w-3.5" />,
            },
            {
              status: 'active' as const,
              icon: <Activity className="h-3.5 w-3.5" />,
            },
            {
              status: 'failed' as const,
              icon: <XCircle className="h-3.5 w-3.5" />,
            },
            {
              status: 'locked' as const,
              icon: <Lock className="h-3.5 w-3.5" />,
            },
            {
              status: 'pending' as const,
              icon: <Circle className="h-3.5 w-3.5" />,
            },
          ].map(({ status, icon }) => {
            const color = STATUS_COLORS[status];
            return (
              <div key={status} className="flex items-center gap-1.5">
                <StatusDot status={status} />
                <span className={`text-xs font-medium ${color.text}`}>
                  {color.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Phase accordions */}
        <div className="space-y-4">
          {phases.map((phase) => (
            <PhaseAccordionCard key={phase.id} phase={phase} />
          ))}
        </div>

        {/* Bottom execution summary */}
        <div className="mt-8 rounded-xl bg-slate-900 p-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <StatusDot status="gold" />
                <span className="text-xs text-slate-300">2 Gold Standard</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status="active" />
                <span className="text-xs text-slate-300">1 Active</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status="buffer" />
                <span className="text-xs text-slate-300">3 In Buffer</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status="locked" />
                <span className="text-xs text-slate-300">1 Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status="pending" />
                <span className="text-xs text-slate-300">1 Pending</span>
              </div>
            </div>
            <div className="font-metric flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400">Workflow Duration: </span>
                <span className="text-white">28m 07s</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <div>
                <span className="text-slate-400">ETA: </span>
                <span className="text-emerald-400">~15m remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
