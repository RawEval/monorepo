'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@raweval/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@raweval/ui/select';
import { Loader2, Play, Monitor, MessageSquareText, Briefcase, FileText, ArrowLeft, AlertTriangle, DollarSign, User2 } from 'lucide-react';
import { apiClient } from '@raweval/api-client';
import { orchestratorService } from '@/services/orchestrator-service';
import { sessionService } from '@/services/session-service';
import { interviewV2Service } from '@/services/interview-v2-service';
import { useInterviewStore } from '@/stores/interview-store';
import type { StartInterviewRequest, AvatarPreset } from '@/features/interview/types';

type InterviewMode = 'text' | 'video';

interface WorkbenchJob {
  id: number;
  title: string;
  domain_name: string | null;
  description: string;
  experience_level: string | null;
  interview_type: string;
  interview_duration_minutes: number;
  min_questions: number;
  difficulty: string;
  seniority: string;
}

interface UserMetadata {
  professional_background?: string;
  college?: string;
  highest_education?: string;
}

function InterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get('job_id');
  const { setSession, setCurrentQuestion, updateProgress, setPhase } = useInterviewStore();

  // Form state
  const [interviewType, setInterviewType] = useState('full_stack');
  const [seniority, setSeniority] = useState('mid');
  const [difficulty, setDifficulty] = useState('medium');
  const [duration, setDuration] = useState(30);
  const [minQuestions, setMinQuestions] = useState(10);
  const [mode, setMode] = useState<InterviewMode>('text');

  // V2 options
  const [sttProvider, setSttProvider] = useState('whisper');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [cheatDetection, setCheatDetection] = useState(true);
  const [avatarEnabled, setAvatarEnabled] = useState(false);
  const [avatarPreset, setAvatarPreset] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cost estimate
  const { data: costEstimate } = useQuery({
    queryKey: ['cost-estimate', interviewType, duration, minQuestions],
    queryFn: () => sessionService.getCostEstimate({
      interview_type: interviewType,
      total_time_minutes: duration,
      min_questions: minQuestions,
    }),
    staleTime: 30000,
  });

  // Avatar presets
  const { data: avatarPresetsData } = useQuery({
    queryKey: ['avatar-presets'],
    queryFn: () => interviewV2Service.getAvatarPresets(),
    enabled: mode === 'video',
    staleTime: 300000,
  });

  const avatarPresets: AvatarPreset[] = avatarPresetsData?.presets ?? [];

  // Fetch user metadata (resume text)
  // NOTE: /users/me/metadata has a backend routing bug, so fetch user ID first
  const { data: userMeta, isLoading: metaLoading } = useQuery({
    queryKey: ['user-metadata'],
    queryFn: async () => {
      const me = await apiClient.get<{ id: number }>('/users/me');
      return apiClient.get<UserMetadata>(`/users/${me.id}/metadata`);
    },
  });

  // Fetch job details if job_id is present
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job-detail', jobIdParam],
    queryFn: () => apiClient.get<WorkbenchJob>(`/workbench/interviews/jobs/${jobIdParam}`),
    enabled: !!jobIdParam,
  });

  // Pre-fill from job when loaded
  useEffect(() => {
    if (job) {
      setInterviewType(job.interview_type || 'full_stack');
      setSeniority(job.seniority || 'mid');
      setDifficulty(job.difficulty || 'medium');
      setDuration(job.interview_duration_minutes || 30);
      setMinQuestions(job.min_questions || 10);
    }
  }, [job]);

  const resumeText = userMeta?.professional_background ?? '';
  const jobDescription = job?.description ?? '';
  const hasResume = resumeText.length >= 50;
  const canSubmit = !isSubmitting && !metaLoading;

  async function handleStart() {
    if (isSubmitting) return;

    // For text interview without job, we need some JD — use a generic one
    const finalResume = resumeText || 'Experienced professional with broad domain expertise across technology, engineering, and research. Skilled in problem-solving, technical analysis, and critical evaluation of complex systems.';
    const finalJD = jobDescription || 'Domain expert evaluation interview for RawEval. We are looking for experts who can evaluate AI model outputs for accuracy, completeness, and correctness across various domains.';

    if (finalResume.length < 50) {
      setError('Resume text is too short. Please upload a resume in the onboarding section first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'video') {
        // Conversational AI interview (spoken)
        const { conversationalService } = await import('@/services/conversational-service');

        const role = job?.title || `${seniority} ${interviewType.replace('_', ' ')} engineer`;
        const domain = job?.domain_name || interviewType;

        const convResponse = await conversationalService.initialize({
          role,
          domain,
          job_id: job?.id,
        });

        setSession(convResponse.session_id);
        setPhase('connected');

        router.push(`/interview/${convResponse.session_id}/v2`);
      } else {
        // V1 text interview via orchestrator
        const request: StartInterviewRequest = {
          resume_text: finalResume,
          job_description: finalJD,
          interview_type: interviewType as StartInterviewRequest['interview_type'],
          seniority: seniority as StartInterviewRequest['seniority'],
          difficulty: difficulty as StartInterviewRequest['difficulty'],
          total_time_minutes: duration,
          min_questions: minQuestions,
        };

        const response = await orchestratorService.startInterview(request);

        setSession(response.session_id);
        setPhase('connected');

        if (response.first_question) {
          setCurrentQuestion(response.first_question);
        }

        if (response.plan_summary) {
          updateProgress({
            questions_asked: response.first_question ? 1 : 0,
            questions_answered: 0,
            total_planned: response.plan_summary.total_planned_questions,
            is_complete: false,
          });
        }

        router.push(`/interview/${response.session_id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start interview. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-primary)',
    width: '100%',
  };

  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] items-start justify-center"
      style={{ padding: 'var(--section-y) var(--section-x)' }}
    >
      <div style={{ maxWidth: '720px', width: '100%' }}>
        {/* Back link */}
        <Link
          href={jobIdParam ? '/jobs' : '/onboarding'}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-6)',
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          {jobIdParam ? 'Back to jobs' : 'Back'}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="eyebrow"><span className="eyebrow-text">Interview Setup</span></div>
          <h1 className="section-heading" style={{ color: 'var(--color-text-primary)' }}>
            Start Your Interview
          </h1>
          <p className="mt-2" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
            {mode === 'video'
              ? 'AI avatar interview — the interviewer will speak questions and you answer by voice.'
              : 'Text-based interview — questions appear as text and you type your answers.'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', boxShadow: 'var(--shadow-md)' }}>
          <div className="space-y-6">

            {/* Resume status */}
            <div style={{
              padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            }}>
              <FileText style={{ width: 16, height: 16, color: hasResume ? 'var(--color-success)' : 'var(--color-warning)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {metaLoading ? 'Loading resume...' : hasResume ? 'Resume loaded from profile' : 'No resume found'}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {hasResume
                    ? `${resumeText.length} characters · Auto-loaded from your uploaded resume`
                    : 'Upload a resume in onboarding to improve interview quality'}
                </div>
              </div>
              {!hasResume && !metaLoading && (
                <Link href="/onboarding" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-signal)', textDecoration: 'none' }}>
                  Upload →
                </Link>
              )}
            </div>

            {/* Job context */}
            {jobLoading && jobIdParam && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-base)' }}>
                <Loader2 className="size-4 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Loading job details...</span>
              </div>
            )}

            {job && (
              <div style={{ padding: 'var(--space-5)', border: '1px solid var(--color-signal-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-signal-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <Briefcase style={{ width: 14, height: 14, color: 'var(--color-signal)' }} />
                  <span className="mono-label" style={{ color: 'var(--color-signal)', fontSize: '10px' }}>Selected Job</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{job.title}</div>
                {job.domain_name && <span className="mono-label" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{job.domain_name}</span>}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', marginTop: 'var(--space-2)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{job.description}</p>
              </div>
            )}

            {/* No resume warning */}
            {!hasResume && !metaLoading && (
              <div style={{ padding: 'var(--space-3) var(--space-4)', border: '1px solid rgba(138,106,0,0.3)', borderRadius: 'var(--radius-md)', background: 'var(--color-warning-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <AlertTriangle style={{ width: 14, height: 14, color: 'var(--color-warning)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-warning)' }}>
                  A default resume text will be used. For best results, upload your resume first.
                </span>
              </div>
            )}

            {/* Configuration */}
            <div className="space-y-3">
              <h3 className="mono-label" style={{ color: 'var(--color-text-muted)' }}>Configuration</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="mono-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Interview Type</Label>
                  <Select value={interviewType} onValueChange={setInterviewType} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_stack">Full Stack</SelectItem>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="data_science">Data Science</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="system_design">System Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="mono-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Seniority</Label>
                  <Select value={seniority} onValueChange={setSeniority} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="mono-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="mono-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Duration (minutes)</Label>
                  <input type="number" min={10} max={90} value={duration} onChange={(e) => setDuration(Number(e.target.value))} disabled={isSubmitting} style={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <Label className="mono-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Min Questions</Label>
                  <input type="number" min={5} max={30} value={minQuestions} onChange={(e) => setMinQuestions(Number(e.target.value))} disabled={isSubmitting} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="space-y-3">
              <h3 className="mono-label" style={{ color: 'var(--color-text-muted)' }}>Mode</h3>
              <div className="flex gap-3">
                <button type="button" onClick={() => setMode('text')} disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2"
                  style={{ borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 'var(--text-sm)', fontWeight: 500, border: mode === 'text' ? '1px solid var(--color-signal)' : '1px solid var(--color-border)', background: mode === 'text' ? 'var(--color-signal-subtle)' : 'var(--color-bg-base)', color: mode === 'text' ? 'var(--color-signal)' : 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  <MessageSquareText className="size-4" /> Text Interview
                </button>
                <button type="button" onClick={() => setMode('video')} disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2"
                  style={{ borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 'var(--text-sm)', fontWeight: 500, border: mode === 'video' ? '1px solid var(--color-signal)' : '1px solid var(--color-border)', background: mode === 'video' ? 'var(--color-signal-subtle)' : 'var(--color-bg-base)', color: mode === 'video' ? 'var(--color-signal)' : 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  <Monitor className="size-4" /> AI Avatar Interview
                </button>
              </div>

              {mode === 'video' && (
                <div style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
                    AI avatar will speak questions aloud. You answer by voice. Camera required for integrity monitoring.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="mono-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>STT Provider</Label>
                      <Select value={sttProvider} onValueChange={setSttProvider} disabled={isSubmitting}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whisper">Whisper</SelectItem>
                          <SelectItem value="deepgram">Deepgram</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="mono-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Noise Suppression</Label>
                      <button type="button" onClick={() => setNoiseSuppression(!noiseSuppression)} disabled={isSubmitting} className="flex w-full items-center justify-center" style={{ height: '36px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500, border: noiseSuppression ? '1px solid var(--color-success-border)' : '1px solid var(--color-border)', background: noiseSuppression ? 'var(--color-success-subtle)' : 'var(--color-bg-surface)', color: noiseSuppression ? 'var(--color-success)' : 'var(--color-text-muted)', cursor: 'pointer' }}>
                        {noiseSuppression ? 'On' : 'Off'}
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="mono-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Cheat Detection</Label>
                      <button type="button" onClick={() => setCheatDetection(!cheatDetection)} disabled={isSubmitting} className="flex w-full items-center justify-center" style={{ height: '36px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500, border: cheatDetection ? '1px solid var(--color-success-border)' : '1px solid var(--color-border)', background: cheatDetection ? 'var(--color-success-subtle)' : 'var(--color-bg-surface)', color: cheatDetection ? 'var(--color-success)' : 'var(--color-text-muted)', cursor: 'pointer' }}>
                        {cheatDetection ? 'On' : 'Off'}
                      </button>
                    </div>
                  </div>

                  {/* Avatar Preset Picker */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="mono-label" style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>AI Avatar</Label>
                      <button
                        type="button"
                        onClick={() => { setAvatarEnabled(!avatarEnabled); if (avatarEnabled) setAvatarPreset(null); }}
                        disabled={isSubmitting}
                        className="flex items-center justify-center"
                        style={{
                          height: '28px', padding: '0 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 500,
                          border: avatarEnabled ? '1px solid var(--color-success-border)' : '1px solid var(--color-border)',
                          background: avatarEnabled ? 'var(--color-success-subtle)' : 'var(--color-bg-surface)',
                          color: avatarEnabled ? 'var(--color-success)' : 'var(--color-text-muted)', cursor: 'pointer',
                        }}
                      >
                        {avatarEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    {avatarEnabled && avatarPresets.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {avatarPresets.map((preset) => (
                          <button
                            key={preset.preset_id}
                            type="button"
                            onClick={() => setAvatarPreset(preset.preset_id)}
                            disabled={isSubmitting}
                            style={{
                              padding: '10px 8px',
                              borderRadius: 'var(--radius-md)',
                              border: avatarPreset === preset.preset_id ? '2px solid var(--color-signal)' : '1px solid var(--color-border)',
                              background: avatarPreset === preset.preset_id ? 'var(--color-signal-subtle)' : 'var(--color-bg-surface)',
                              cursor: 'pointer',
                              textAlign: 'center',
                            }}
                          >
                            <User2
                              className="mx-auto size-6"
                              style={{ color: avatarPreset === preset.preset_id ? 'var(--color-signal)' : 'var(--color-text-muted)' }}
                            />
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                              {preset.name}
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: '1.3' }}>
                              {preset.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {avatarEnabled && avatarPresets.length === 0 && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Loading avatar presets...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cost Estimate */}
            {costEstimate && (
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-base)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <DollarSign style={{ width: 14, height: 14, color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Estimated cost: <strong style={{ color: 'var(--color-text-primary)' }}>${costEstimate.estimated_cost_usd.toFixed(2)}</strong>
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid rgba(192,57,43,0.2)', background: 'var(--color-error-subtle)', padding: '12px 16px', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}

            {/* Start Button */}
            <button
              type="button" onClick={handleStart} disabled={!canSubmit}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 'var(--text-sm)', opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            >
              {isSubmitting ? (
                <><Loader2 className="size-5 animate-spin" /> Starting Interview...</>
              ) : (
                <><Play className="size-5" /> {mode === 'video' ? 'Begin AI Avatar Interview' : 'Begin Text Interview'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewSetupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    }>
      <InterviewSetupContent />
    </Suspense>
  );
}
