'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@raweval/api-client';
import { Loader2, Clock, MessageSquare, BarChart3, ArrowRight, Briefcase } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  slug: string;
  domain_name: string;
  description: string;
  experience_level: string;
  interview_type: string;
  interview_duration_minutes: number;
  min_questions: number;
  difficulty: string;
  seniority: string;
  responsibilities?: string;
  requirements?: string;
  preferred_skills?: string;
  is_active: boolean;
  created_at: string;
}

interface JobsResponse {
  total: number;
  items: Job[];
}

async function fetchJobs(): Promise<JobsResponse> {
  return apiClient.get<JobsResponse>(
    '/workbench/interviews/jobs?job_type=expert_onboarding&is_active=true',
  );
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

export default function JobsPage() {
  const { data, isLoading, error } = useQuery<JobsResponse>({
    queryKey: ['jobs', 'expert_onboarding'],
    queryFn: fetchJobs,
  });

  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] items-start justify-center"
      style={{ padding: 'var(--section-y) var(--section-x)' }}
    >
      <div style={{ maxWidth: '960px', width: '100%' }}>
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>
            <span className="eyebrow-text">Available Jobs</span>
          </div>
          <h1
            className="section-heading"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Expert Opportunities
          </h1>
          <p
            className="mt-2"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            Browse available interview jobs and start earning as a domain expert.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2
              className="size-8 animate-spin"
              style={{ color: 'var(--color-signal)' }}
            />
            <p
              className="mt-4"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Loading jobs...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(192,57,43,0.2)',
              background: 'var(--color-error-subtle)',
              padding: '16px 20px',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-error)',
              textAlign: 'center',
            }}
          >
            {error instanceof Error ? error.message : 'Failed to load jobs. Please try again.'}
          </div>
        )}

        {/* Empty State */}
        {data && data.items.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <Briefcase
              className="size-12"
              style={{ color: 'var(--color-text-faint)' }}
            />
            <p
              className="mt-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
              }}
            >
              No jobs available right now
            </p>
            <p
              className="mt-1"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Check back later or start a general interview below.
            </p>
          </div>
        )}

        {/* Job Cards Grid */}
        {data && data.items.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {data.items.map((job) => (
              <div
                key={job.id}
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Domain badge */}
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
                  {/* Experience level badge */}
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
                </div>

                {/* Title */}
                <h3
                  className="mt-3"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-snug)',
                  }}
                >
                  {job.title}
                </h3>

                {/* Description (3-line clamp) */}
                <p
                  className="mt-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1,
                  }}
                >
                  {job.description}
                </p>

                {/* Meta row */}
                <div
                  className="mt-4 flex flex-wrap items-center gap-4"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {job.interview_duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="size-3.5" />
                    {job.min_questions} questions
                  </span>
                  <span
                    className="flex items-center gap-1"
                    style={{
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      background: difficultyBg(job.difficulty),
                      color: difficultyColor(job.difficulty),
                      fontWeight: 500,
                    }}
                  >
                    <BarChart3 className="size-3.5" />
                    {job.difficulty}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href={`/interview/setup?job_id=${job.id}`}
                  className="btn-primary mt-5"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px 20px',
                    fontSize: 'var(--text-sm)',
                    textDecoration: 'none',
                  }}
                >
                  Start Interview
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* General Interview Option */}
        <div
          className="mt-8"
          style={{
            background: 'var(--color-bg-inverse)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-inverse)',
              fontWeight: 500,
            }}
          >
            Don&apos;t see the right fit?
          </h3>
          <p
            className="mt-1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-inverse-muted)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            Start a general interview to showcase your skills across multiple domains.
          </p>
          <Link
            href="/interview/setup"
            className="mt-5 inline-flex items-center gap-2"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-signal)',
              color: 'var(--color-text-inverse)',
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-signal-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-signal)';
            }}
          >
            Start General Interview
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
