'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@raweval/api-client';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Clock,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Star,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface JobDetail {
  id: number;
  title: string;
  slug: string;
  domain_id: number | null;
  domain_name: string | null;
  description: string;
  responsibilities: string[] | null;
  requirements: string[] | null;
  preferred_skills: string[] | null;
  experience_level: string | null;
  job_type: string;
  interview_type: string;
  interview_duration_minutes: number;
  min_questions: number;
  difficulty: string;
  seniority: string;
  is_active: boolean;
  created_at: string;
}

function difficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'var(--color-success)';
    case 'medium':
      return 'var(--color-warning)';
    case 'hard':
    case 'expert':
      return 'var(--color-error)';
    default:
      return 'var(--color-text-muted)';
  }
}

function difficultyBg(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'var(--color-success-subtle)';
    case 'medium':
      return 'var(--color-warning-subtle)';
    case 'hard':
    case 'expert':
      return 'var(--color-error-subtle)';
    default:
      return 'var(--color-bg-muted)';
  }
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);

  const { data: job, isLoading, error } = useQuery<JobDetail>({
    queryKey: ['job-detail', jobId],
    queryFn: () => apiClient.get<JobDetail>(`/workbench/interviews/jobs/${jobId}`),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin" style={{ color: 'var(--color-signal)' }} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto text-center" style={{ maxWidth: '672px', padding: 'var(--section-y) var(--section-x)' }}>
        <AlertTriangle className="mx-auto size-12" style={{ color: 'var(--color-error)' }} />
        <h2
          className="mt-4"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)', fontWeight: 400 }}
        >
          Job not found
        </h2>
        <p style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {error instanceof Error ? error.message : 'This job may no longer be available.'}
        </p>
        <Link href="/jobs" className="btn-primary mt-6 inline-flex" style={{ textDecoration: 'none' }}>
          <ArrowLeft className="size-4" />
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] items-start justify-center"
      style={{ padding: 'var(--section-y) var(--section-x)' }}
    >
      <div style={{ maxWidth: '800px', width: '100%' }}>
        {/* Back link */}
        <Link
          href="/jobs"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: 'var(--space-6)',
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to jobs
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {job.domain_name && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-signal-subtle)',
                  color: 'var(--color-signal)',
                  border: '1px solid var(--color-signal-border)',
                }}
              >
                {job.domain_name}
              </span>
            )}
            {job.experience_level && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-info-subtle)',
                  color: 'var(--color-info)',
                  border: '1px solid var(--color-info-border)',
                }}
              >
                {job.experience_level}
              </span>
            )}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                background: difficultyBg(job.difficulty),
                color: difficultyColor(job.difficulty),
              }}
            >
              {job.difficulty}
            </span>
          </div>

          <h1
            className="section-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {job.title}
          </h1>

          {/* Meta row */}
          <div
            className="mt-3 flex flex-wrap items-center gap-5"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {job.interview_duration_minutes} min interview
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="size-3.5" />
              {job.min_questions} questions min
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="size-3.5" />
              {job.seniority} level
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="size-3.5" />
              {job.interview_type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Main card */}
        <div
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="space-y-8">
            {/* Description */}
            <div>
              <h3
                className="mono-label mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Job Description
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {job.description}
              </p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h3
                  className="mono-label mb-3"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Responsibilities
                </h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 'var(--leading-relaxed)',
                      }}
                    >
                      <CheckCircle2
                        className="size-4 shrink-0"
                        style={{ color: 'var(--color-success)', marginTop: '2px' }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h3
                  className="mono-label mb-3"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {job.requirements.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 'var(--leading-relaxed)',
                      }}
                    >
                      <span
                        className="mt-2 block size-1.5 shrink-0 rounded-full"
                        style={{ background: 'var(--color-signal)' }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preferred Skills */}
            {job.preferred_skills && job.preferred_skills.length > 0 && (
              <div>
                <h3
                  className="mono-label mb-3"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Preferred Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.preferred_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1.5"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <Star className="size-3" style={{ color: 'var(--color-warning)' }} />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--space-6)',
              }}
            >
              <Link
                href={`/interview/setup?job_id=${job.id}`}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: 'var(--text-sm)',
                  textDecoration: 'none',
                }}
              >
                Start Interview for this Job
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
