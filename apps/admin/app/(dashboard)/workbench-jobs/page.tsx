'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { apiClient } from '@/lib/api-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkbenchJob {
  id: number;
  title: string;
  slug: string;
  domain_id: number | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferred_skills: string[];
  experience_level: string | null;
  job_type: string;
  interview_type: string | null;
  interview_duration_minutes: number;
  min_questions: number;
  difficulty: string | null;
  seniority: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkbenchJobListResponse {
  items: WorkbenchJob[];
  total: number;
  page: number;
  page_size: number;
}

interface CreateJobRequest {
  title: string;
  slug?: string;
  domain_id?: number;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  preferred_skills?: string[];
  experience_level?: string;
  job_type?: string;
  interview_type?: string;
  interview_duration_minutes?: number;
  min_questions?: number;
  difficulty?: string;
  seniority?: string;
}

interface PromptTemplate {
  id: number;
  job_id: number;
  segment_type: string;
  system_prompt: string;
  model_override: string | null;
  temperature: number | null;
  created_at: string;
  updated_at: string;
}

interface CreatePromptRequest {
  segment_type: string;
  system_prompt: string;
  model_override?: string;
  temperature?: number;
}

// ---------------------------------------------------------------------------
// API helpers (thin wrappers that go through the shared apiClient)
// ---------------------------------------------------------------------------

function handleResponse<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'success' in response) {
    const r = response as { success: boolean; data: T; error?: string };
    if (!r.success || r.error) throw new Error(r.error ?? 'API request failed');
    return r.data;
  }
  return response as T;
}

const jobsApi = {
  list: async (page: number, pageSize: number) => {
    const res = await apiClient.get<WorkbenchJobListResponse>(
      `/admin/workbench-jobs?page=${page}&page_size=${pageSize}`
    );
    return handleResponse<WorkbenchJobListResponse>(res);
  },
  get: async (id: number) => {
    const res = await apiClient.get<WorkbenchJob>(`/admin/workbench-jobs/${id}`);
    return handleResponse<WorkbenchJob>(res);
  },
  create: async (data: CreateJobRequest) => {
    const res = await apiClient.post<WorkbenchJob>('/admin/workbench-jobs', data);
    return handleResponse<WorkbenchJob>(res);
  },
  update: async (id: number, data: Partial<CreateJobRequest>) => {
    const res = await apiClient.put<WorkbenchJob>(
      `/admin/workbench-jobs/${id}`,
      data
    );
    return handleResponse<WorkbenchJob>(res);
  },
  remove: async (id: number) => {
    const res = await apiClient.delete<{ ok: boolean }>(
      `/admin/workbench-jobs/${id}`
    );
    return handleResponse<{ ok: boolean }>(res);
  },
  listPrompts: async (jobId: number) => {
    const res = await apiClient.get<PromptTemplate[]>(
      `/admin/workbench-jobs/${jobId}/prompts`
    );
    return handleResponse<PromptTemplate[]>(res);
  },
  createPrompt: async (jobId: number, data: CreatePromptRequest) => {
    const res = await apiClient.post<PromptTemplate>(
      `/admin/workbench-jobs/${jobId}/prompts`,
      data
    );
    return handleResponse<PromptTemplate>(res);
  },
};

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const wbKeys = {
  all: ['workbench-jobs'] as const,
  list: (page: number, pageSize: number) =>
    ['workbench-jobs', 'list', { page, pageSize }] as const,
  detail: (id: number) => ['workbench-jobs', 'detail', id] as const,
  prompts: (id: number) => ['workbench-jobs', 'prompts', id] as const,
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'lead'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const SENIORITIES = ['junior', 'mid', 'senior', 'lead', 'principal'] as const;
const INTERVIEW_TYPES = [
  'full_stack',
  'backend',
  'frontend',
  'data_science',
  'machine_learning',
  'devops',
  'mobile',
] as const;
const SEGMENT_TYPES = [
  'conversation',
  'technical',
  'coding',
  'behavioral',
] as const;
const MODEL_OPTIONS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] as const;

// ---------------------------------------------------------------------------
// Blank form states
// ---------------------------------------------------------------------------

const BLANK_JOB: CreateJobRequest = {
  title: '',
  description: '',
  responsibilities: [],
  requirements: [],
  preferred_skills: [],
  experience_level: '',
  job_type: 'expert_onboarding',
  interview_type: '',
  interview_duration_minutes: 30,
  min_questions: 10,
  difficulty: '',
  seniority: '',
};

const BLANK_PROMPT: CreatePromptRequest = {
  segment_type: 'conversation',
  system_prompt: '',
  model_override: undefined,
  temperature: undefined,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TagInput({
  label,
  tags,
  onChange,
}: {
  label: string;
  tags: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const add = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  }, [input, tags, onChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  };

  return (
    <div>
      <label className="text-muted-foreground mb-1 block text-sm font-medium">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="hover:text-destructive ml-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="mt-1 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="border-input bg-background text-foreground placeholder:text-muted-foreground flex-1 rounded-md border px-3 py-1.5 text-sm outline-none"
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// JobForm
// ---------------------------------------------------------------------------

function JobForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  initialData: CreateJobRequest;
  onSubmit: (data: CreateJobRequest) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<CreateJobRequest>(initialData);

  const set = <K extends keyof CreateJobRequest>(
    key: K,
    value: CreateJobRequest[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Title */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Title *
          </label>
          <input
            required
            maxLength={255}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Slug (auto-generated if empty)
          </label>
          <input
            value={form.slug ?? ''}
            onChange={(e) => set('slug', e.target.value || undefined)}
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>

        {/* Domain ID */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Domain ID
          </label>
          <input
            type="number"
            value={form.domain_id ?? ''}
            onChange={(e) =>
              set('domain_id', e.target.value ? Number(e.target.value) : undefined)
            }
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Experience Level
          </label>
          <select
            value={form.experience_level ?? ''}
            onChange={(e) => set('experience_level', e.target.value || undefined)}
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          >
            <option value="">-- select --</option>
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Difficulty
          </label>
          <select
            value={form.difficulty ?? ''}
            onChange={(e) => set('difficulty', e.target.value || undefined)}
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          >
            <option value="">-- select --</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Seniority */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Seniority
          </label>
          <select
            value={form.seniority ?? ''}
            onChange={(e) => set('seniority', e.target.value || undefined)}
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          >
            <option value="">-- select --</option>
            {SENIORITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Interview Type */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Interview Type
          </label>
          <select
            value={form.interview_type ?? ''}
            onChange={(e) => set('interview_type', e.target.value || undefined)}
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          >
            <option value="">-- select --</option>
            {INTERVIEW_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Interview Duration */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Duration (min)
          </label>
          <input
            type="number"
            min={5}
            max={180}
            value={form.interview_duration_minutes ?? 30}
            onChange={(e) =>
              set('interview_duration_minutes', Number(e.target.value))
            }
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>

        {/* Min Questions */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Min Questions
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.min_questions ?? 10}
            onChange={(e) => set('min_questions', Number(e.target.value))}
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="text-muted-foreground mb-1 block text-sm font-medium">
            Job Type
          </label>
          <input
            value={form.job_type ?? 'expert_onboarding'}
            onChange={(e) => set('job_type', e.target.value)}
            className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-muted-foreground mb-1 block text-sm font-medium">
          Description *
        </label>
        <textarea
          required
          minLength={10}
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
        />
      </div>

      {/* Tag inputs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TagInput
          label="Responsibilities"
          tags={form.responsibilities ?? []}
          onChange={(v) => set('responsibilities', v)}
        />
        <TagInput
          label="Requirements"
          tags={form.requirements ?? []}
          onChange={(v) => set('requirements', v)}
        />
        <TagInput
          label="Preferred Skills"
          tags={form.preferred_skills ?? []}
          onChange={(v) => set('preferred_skills', v)}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// PromptManager
// ---------------------------------------------------------------------------

function PromptManager({ jobId }: { jobId: number }) {
  const queryClient = useQueryClient();
  const [activeSegment, setActiveSegment] = useState<string>('conversation');
  const [promptForm, setPromptForm] = useState<CreatePromptRequest>({
    ...BLANK_PROMPT,
  });

  const { data: prompts, isLoading } = useQuery({
    queryKey: wbKeys.prompts(jobId),
    queryFn: () => jobsApi.listPrompts(jobId),
  });

  const saveMutation = useMutation({
    mutationFn: (data: CreatePromptRequest) =>
      jobsApi.createPrompt(jobId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: wbKeys.prompts(jobId) });
    },
  });

  // Find existing prompt for segment
  const existing = (prompts ?? []).find(
    (p) => p.segment_type === activeSegment
  );

  // Sync form when segment or data changes
  const currentSystemPrompt =
    existing?.system_prompt ?? promptForm.system_prompt;
  const currentModel = existing?.model_override ?? promptForm.model_override;
  const currentTemp = existing?.temperature ?? promptForm.temperature;

  const handleSavePrompt = () => {
    saveMutation.mutate({
      segment_type: activeSegment,
      system_prompt: currentSystemPrompt,
      model_override: currentModel || undefined,
      temperature: currentTemp ?? undefined,
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-foreground text-sm font-semibold">
        Prompt Templates
      </h4>

      {/* Segment tabs */}
      <div className="flex gap-1">
        {SEGMENT_TYPES.map((seg) => {
          const hasPrompt = (prompts ?? []).some(
            (p) => p.segment_type === seg
          );
          return (
            <Button
              key={seg}
              size="sm"
              variant={activeSegment === seg ? 'default' : 'outline'}
              onClick={() => {
                setActiveSegment(seg);
                setPromptForm({ ...BLANK_PROMPT, segment_type: seg });
              }}
              className="gap-1.5 capitalize"
            >
              {seg}
              {hasPrompt && (
                <span className="bg-primary/20 h-1.5 w-1.5 rounded-full" />
              )}
            </Button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading prompts...
        </div>
      ) : (
        <div className="space-y-3">
          {/* System prompt textarea */}
          <div>
            <label className="text-muted-foreground mb-1 block text-sm font-medium">
              System Prompt *
            </label>
            <textarea
              rows={6}
              value={currentSystemPrompt}
              onChange={(e) =>
                setPromptForm((prev) => ({
                  ...prev,
                  system_prompt: e.target.value,
                }))
              }
              placeholder="Enter system prompt (min 10 characters)..."
              className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Model override */}
            <div>
              <label className="text-muted-foreground mb-1 block text-sm font-medium">
                Model Override
              </label>
              <select
                value={currentModel ?? ''}
                onChange={(e) =>
                  setPromptForm((prev) => ({
                    ...prev,
                    model_override: e.target.value || undefined,
                  }))
                }
                className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
              >
                <option value="">Default</option>
                {MODEL_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div>
              <label className="text-muted-foreground mb-1 block text-sm font-medium">
                Temperature ({currentTemp ?? 'default'})
              </label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={currentTemp ?? 0.7}
                onChange={(e) =>
                  setPromptForm((prev) => ({
                    ...prev,
                    temperature: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSavePrompt}
            disabled={
              saveMutation.isPending || currentSystemPrompt.length < 10
            }
            className="gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Prompt
          </Button>

          {saveMutation.isError && (
            <p className="text-destructive text-sm">
              Failed to save prompt. Please try again.
            </p>
          )}
          {saveMutation.isSuccess && (
            <p className="text-sm text-green-600">Prompt saved.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation
// ---------------------------------------------------------------------------

function DeleteConfirm({
  jobTitle,
  onConfirm,
  onCancel,
  isPending,
}: {
  jobTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="bg-destructive/5 border-destructive/20 flex items-center gap-3 rounded-md border p-3">
      <AlertTriangle className="text-destructive h-5 w-5 shrink-0" />
      <p className="text-sm">
        Deactivate <span className="font-semibold">{jobTitle}</span>? This
        soft-deletes the job.
      </p>
      <div className="ml-auto flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Confirm'
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function WorkbenchJobsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);

  // --- Queries ---
  const {
    data: jobsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: wbKeys.list(page, PAGE_SIZE),
    queryFn: () => jobsApi.list(page, PAGE_SIZE),
  });

  const jobs = jobsData?.items ?? [];
  const totalPages = jobsData ? Math.ceil(jobsData.total / PAGE_SIZE) : 0;

  // Fetch detail when editing
  const { data: editJobDetail } = useQuery({
    queryKey: wbKeys.detail(editingJobId!),
    queryFn: () => jobsApi.get(editingJobId!),
    enabled: editingJobId !== null,
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (data: CreateJobRequest) => jobsApi.create(data),
    onSuccess: () => {
      setShowCreate(false);
      void queryClient.invalidateQueries({ queryKey: wbKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateJobRequest>;
    }) => jobsApi.update(id, data),
    onSuccess: () => {
      setEditingJobId(null);
      void queryClient.invalidateQueries({ queryKey: wbKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jobsApi.remove(id),
    onSuccess: () => {
      setDeletingJobId(null);
      void queryClient.invalidateQueries({ queryKey: wbKeys.all });
    },
  });

  // --- Helpers ---
  const difficultyVariant = (d: string | null) => {
    if (d === 'easy') return 'secondary' as const;
    if (d === 'hard') return 'destructive' as const;
    return 'default' as const;
  };

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">
            Workbench Jobs
          </h1>
          <p className="text-muted-foreground text-sm">
            Create and manage interview jobs for expert onboarding
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setShowCreate(true);
            setEditingJobId(null);
          }}
        >
          <Plus className="h-4 w-4" />
          Create Job
        </Button>
      </div>

      {/* Error state */}
      {isError && (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertTriangle className="text-destructive mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              Failed to load jobs. Please try refreshing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Jobs table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5" />
            Jobs
            {jobsData && (
              <Badge variant="secondary" className="ml-2">
                {jobsData.total}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No jobs found. Create your first job above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border text-muted-foreground border-b text-left">
                    <th className="pb-2 pr-4 font-medium">Title</th>
                    <th className="pb-2 pr-4 font-medium">Domain</th>
                    <th className="pb-2 pr-4 font-medium">Difficulty</th>
                    <th className="pb-2 pr-4 font-medium">Seniority</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-border hover:bg-muted/50 border-b last:border-0"
                    >
                      <td className="text-foreground py-3 pr-4 font-medium">
                        {job.title}
                      </td>
                      <td className="text-muted-foreground py-3 pr-4">
                        {job.domain_id ?? '-'}
                      </td>
                      <td className="py-3 pr-4">
                        {job.difficulty ? (
                          <Badge
                            variant={difficultyVariant(job.difficulty)}
                            className="capitalize"
                          >
                            {job.difficulty}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {job.seniority ? (
                          <Badge variant="outline" className="capitalize">
                            {job.seniority}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={job.is_active ? 'default' : 'secondary'}
                        >
                          {job.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingJobId(
                                editingJobId === job.id ? null : job.id
                              );
                              setShowCreate(false);
                              setDeletingJobId(null);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDeletingJobId(
                                deletingJobId === job.id ? null : job.id
                              );
                            }}
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      {deletingJobId !== null && (
        <DeleteConfirm
          jobTitle={
            jobs.find((j) => j.id === deletingJobId)?.title ?? 'this job'
          }
          onConfirm={() => deleteMutation.mutate(deletingJobId)}
          onCancel={() => setDeletingJobId(null)}
          isPending={deleteMutation.isPending}
        />
      )}

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <JobForm
              initialData={{ ...BLANK_JOB }}
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setShowCreate(false)}
              isPending={createMutation.isPending}
              submitLabel="Create Job"
            />
            {createMutation.isError && (
              <p className="text-destructive mt-2 text-sm">
                Failed to create job. Please check fields and try again.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit form + prompt manager */}
      {editingJobId !== null && editJobDetail && (
        <Card>
          <CardHeader>
            <CardTitle>Edit: {editJobDetail.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <JobForm
              initialData={{
                title: editJobDetail.title,
                slug: editJobDetail.slug,
                domain_id: editJobDetail.domain_id ?? undefined,
                description: editJobDetail.description,
                responsibilities: editJobDetail.responsibilities ?? [],
                requirements: editJobDetail.requirements ?? [],
                preferred_skills: editJobDetail.preferred_skills ?? [],
                experience_level: editJobDetail.experience_level ?? '',
                job_type: editJobDetail.job_type,
                interview_type: editJobDetail.interview_type ?? '',
                interview_duration_minutes:
                  editJobDetail.interview_duration_minutes,
                min_questions: editJobDetail.min_questions,
                difficulty: editJobDetail.difficulty ?? '',
                seniority: editJobDetail.seniority ?? '',
              }}
              onSubmit={(data) =>
                updateMutation.mutate({ id: editingJobId, data })
              }
              onCancel={() => setEditingJobId(null)}
              isPending={updateMutation.isPending}
              submitLabel="Update Job"
            />
            {updateMutation.isError && (
              <p className="text-destructive mt-2 text-sm">
                Failed to update job. Please try again.
              </p>
            )}

            <hr className="border-border" />

            <PromptManager jobId={editingJobId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
