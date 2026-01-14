'use client';

import { useState } from 'react';
import { Check, X, ArrowRight, Pencil, AlertTriangle } from 'lucide-react';

// Annotation data for the street scene
const annotations = {
  before: [
    {
      id: 1,
      label: 'car',
      x: 8,
      y: 52,
      w: 18,
      h: 28,
      confidence: 71,
      correct: false,
    },
    {
      id: 2,
      label: 'person',
      x: 45,
      y: 35,
      w: 8,
      h: 25,
      confidence: 84,
      correct: true,
    },
    {
      id: 3,
      label: 'car',
      x: 65,
      y: 55,
      w: 15,
      h: 20,
      confidence: 45,
      correct: false,
    },
  ],
  after: [
    {
      id: 1,
      label: 'car',
      x: 5,
      y: 48,
      w: 22,
      h: 35,
      confidence: 96,
      correct: true,
      corrected: true,
    },
    {
      id: 2,
      label: 'person',
      x: 45,
      y: 35,
      w: 8,
      h: 25,
      confidence: 94,
      correct: true,
    },
    {
      id: 3,
      label: 'truck',
      x: 62,
      y: 50,
      w: 20,
      h: 28,
      confidence: 91,
      correct: true,
      corrected: true,
    },
    {
      id: 4,
      label: 'bicycle',
      x: 32,
      y: 58,
      w: 10,
      h: 18,
      confidence: 88,
      correct: true,
      added: true,
    },
  ],
};

interface BoxProps {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
  correct: boolean;
  corrected?: boolean;
  added?: boolean;
}

function BoundingBox({
  label,
  x,
  y,
  w,
  h,
  confidence,
  correct,
  corrected,
  added,
}: BoxProps) {
  const borderColor = correct ? 'border-emerald-400' : 'border-red-400';
  const bgColor = correct ? 'bg-emerald-500' : 'bg-red-500';

  return (
    <div
      className={`absolute border-2 ${borderColor} transition-all`}
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
    >
      {/* Label tag */}
      <div
        className={`absolute -top-6 left-0 flex items-center gap-1 px-1.5 py-0.5 ${bgColor} rounded text-[10px] font-medium whitespace-nowrap text-white`}
      >
        {corrected && <Pencil className="h-2.5 w-2.5" />}
        {added && <span className="text-[8px]">NEW</span>}
        {label}
        <span className="ml-1 opacity-70">{confidence}%</span>
      </div>

      {/* Corner markers */}
      <div className="absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-white" />
      <div className="absolute -top-1 -right-1 h-2 w-2 border-t-2 border-r-2 border-white" />
      <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-white" />
      <div className="absolute -right-1 -bottom-1 h-2 w-2 border-r-2 border-b-2 border-white" />
    </div>
  );
}

function MetricCard({
  label,
  before,
  after,
  unit = '',
  positive = true,
}: {
  label: string;
  before: string;
  after: string;
  unit?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <div className="mb-2 text-xs text-slate-400">{label}</div>
      <div className="flex items-center gap-2">
        <span className="font-metric text-lg text-red-400 line-through opacity-60">
          {before}
          {unit}
        </span>
        <ArrowRight className="h-4 w-4 text-slate-600" />
        <span
          className={`font-metric text-xl font-bold ${positive ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {after}
          {unit}
        </span>
      </div>
    </div>
  );
}

export function AnnotationDemo() {
  const [view, setView] = useState<'before' | 'after'>('after');
  const currentAnnotations =
    view === 'before' ? annotations.before : annotations.after;

  return (
    <section className="bg-slate-900 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium text-purple-400">
            Data Quality
          </p>
          <h2 className="mb-4 text-3xl font-semibold text-white md:text-4xl">
            Expert-verified annotations
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            See how Tier 1 experts correct model outputs — fixing bounding
            boxes, relabeling objects, and catching missed detections.
          </p>
        </div>

        {/* Toggle */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setView('before')}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              view === 'before'
                ? 'border border-red-500/30 bg-red-500/20 text-red-400'
                : 'border border-transparent bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="h-4 w-4" />
            Model Output
          </button>
          <div className="flex items-center gap-2 text-slate-600">
            <div className="h-px w-8 bg-slate-700" />
            <Pencil className="h-4 w-4" />
            <div className="h-px w-8 bg-slate-700" />
          </div>
          <button
            onClick={() => setView('after')}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              view === 'after'
                ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                : 'border border-transparent bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Check className="h-4 w-4" />
            Expert Corrected
          </button>
        </div>

        {/* Main annotation view */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-700">
          {/* Image with annotations */}
          <div className="relative aspect-[16/9]">
            {/* Real street scene image from Unsplash */}
            <img
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=675&fit=crop"
              alt="Urban street scene with vehicles and pedestrians"
              className="h-full w-full object-cover"
            />

            {/* Dark overlay for better box visibility */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Bounding boxes */}
            {currentAnnotations.map((box) => (
              <BoundingBox key={box.id} {...box} />
            ))}

            {/* Status badge */}
            <div
              className={`absolute top-4 left-4 rounded-lg px-3 py-1.5 text-sm font-medium ${
                view === 'before'
                  ? 'bg-red-500/90 text-white'
                  : 'bg-emerald-500/90 text-white'
              }`}
            >
              {view === 'before'
                ? 'Model Output (67% accuracy)'
                : 'Expert Verified (94% accuracy)'}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-lg bg-black/70 px-3 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs text-white">
                <div className="h-3 w-3 rounded-sm border-2 border-emerald-400" />
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <div className="h-3 w-3 rounded-sm border-2 border-red-400" />
                <span>Error</span>
              </div>
              {view === 'after' && (
                <div className="flex items-center gap-2 text-xs text-white">
                  <Pencil className="h-3 w-3 text-amber-400" />
                  <span>Corrected</span>
                </div>
              )}
            </div>

            {/* Object count */}
            <div className="absolute right-4 bottom-4 rounded-lg bg-black/70 px-3 py-2 backdrop-blur-sm">
              <span className="text-xs text-slate-400">Detected: </span>
              <span className="font-metric text-sm text-white">
                {currentAnnotations.length} objects
              </span>
            </div>
          </div>
        </div>

        {/* Metrics comparison */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Detection Accuracy"
            before="67"
            after="94"
            unit="%"
          />
          <MetricCard label="IoU Score" before="0.58" after="0.91" />
          <MetricCard
            label="Missed Objects"
            before="2"
            after="0"
            positive={true}
          />
          <MetricCard label="Mislabeled" before="1" after="0" positive={true} />
        </div>

        {/* What experts fix */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            What experts correct
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                <Pencil className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-white">
                  Box Refinement
                </div>
                <div className="text-xs text-slate-400">
                  Adjust coordinates to tightly fit objects with sub-pixel
                  precision
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                <AlertTriangle className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-white">
                  Label Correction
                </div>
                <div className="text-xs text-slate-400">
                  Fix misclassifications (e.g., truck labeled as car)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-white">
                  Missing Objects
                </div>
                <div className="text-xs text-slate-400">
                  Add annotations for objects the model failed to detect
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
