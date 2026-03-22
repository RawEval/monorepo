'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Cpu,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Eye,
  EyeOff,
  Wrench,
  Sparkles,
  Zap,
  AlertTriangle,
  Filter,
  X,
} from 'lucide-react';
import { adminLLMConfigService } from '@/services/admin/llm-config-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  Card,
  CardContent,
  CardDescription,
} from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@raweval/utils';
import type {
  LLMProvider,
  CreateProviderRequest,
  UpdateProviderRequest,
  LLMModel,
  CreateModelRequest,
  QCStageDefault,
  CreateQCStageModelRequest,
} from '@/services/admin/llm-config-service';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'providers' | 'models' | 'qc-stages';

const TABS: { id: TabId; label: string }[] = [
  { id: 'providers', label: 'Providers' },
  { id: 'models', label: 'Models' },
  { id: 'qc-stages', label: 'QC Stage Models' },
];

const PROVIDER_OPTIONS = [
  'openai',
  'anthropic',
  'google',
  'deepseek',
  'openrouter',
  'groq',
  'azure',
  'together_ai',
  'mistral',
  'cohere',
  'replicate',
  'perplexity',
] as const;

const STAGE_CATEGORIES: Record<string, string[]> = {
  'QC Pipeline': [
    'qc_initial_assessment',
    'qc_deep_analysis',
    'qc_verdict_synthesis',
    'qc_fraud_detection',
    'qc_process_scoring',
    'qc_batch_summary',
  ],
  'Interview Engine': [
    'interview_question_generation',
    'interview_response_evaluation',
    'interview_followup',
    'interview_summary',
  ],
  'Chat & Session': [
    'chat_completion',
    'chat_summary',
    'chat_title_generation',
    'web_search_enhancement',
  ],
  'Expert Matching': [
    'expert_domain_matching',
    'expert_skill_extraction',
    'expert_profile_analysis',
  ],
  Workbench: [
    'workbench_rubric_generation',
    'workbench_annotation_assist',
    'workbench_quality_check',
  ],
};

function getStageCategoryLabel(stage: string): string {
  for (const [cat, stages] of Object.entries(STAGE_CATEGORIES)) {
    if (stages.includes(stage)) return cat;
  }
  return 'Other';
}

const DEFAULT_PROVIDER_FORM: CreateProviderRequest = {
  provider_name: 'openai',
  api_key: '',
  display_name: '',
  base_url: '',
  priority: 0,
  notes: '',
};

const DEFAULT_MODEL_FORM: CreateModelRequest = {
  model_id: '',
  provider_name: '',
  display_name: '',
  description: '',
  supports_vision: false,
  supports_tools: false,
  supports_streaming: true,
  supports_json_mode: false,
  supports_web_search: false,
  max_context_tokens: undefined,
  max_output_tokens: undefined,
  cost_per_1m_input: undefined,
  cost_per_1m_output: undefined,
  category: '',
  quality_tier: '',
};

const DEFAULT_STAGE_OVERRIDE_FORM: CreateQCStageModelRequest = {
  stage_name: '',
  model: '',
  fallback_model: '',
  temperature: 0.0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared form input styles
// ─────────────────────────────────────────────────────────────────────────────

const inputClass = 'border-input bg-background w-full rounded-lg border px-3 py-2 text-sm';
const labelClass = 'text-muted-foreground mb-1 block text-xs font-medium';
const selectClass = 'border-input bg-background w-full rounded-lg border px-3 py-2 text-sm';

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function LLMConfigPage() {
  const [activeTab, setActiveTab] = useState<TabId>('providers');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Cpu className="text-primary h-6 w-6" />
          LLM Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage providers, models, and per-stage model assignments.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'providers' && <ProvidersTab />}
      {activeTab === 'models' && <ModelsTab />}
      {activeTab === 'qc-stages' && <QCStagesTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════════

function ProvidersTab() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<LLMProvider | null>(null);
  const [providerForm, setProviderForm] = useState<CreateProviderRequest>(DEFAULT_PROVIDER_FORM);

  const { data: providers, isLoading } = useQuery({
    queryKey: queryKeys.llmConfig.providers,
    queryFn: () => adminLLMConfigService.listProviders(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProviderRequest) => adminLLMConfigService.createProvider(data),
    onSuccess: () => {
      setCreateOpen(false);
      setProviderForm(DEFAULT_PROVIDER_FORM);
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProviderRequest }) =>
      adminLLMConfigService.updateProvider(id, data),
    onSuccess: () => {
      setEditProvider(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminLLMConfigService.deleteProvider(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      adminLLMConfigService.updateProvider(id, { is_active }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const openEdit = (provider: LLMProvider) => {
    setEditProvider(provider);
    setProviderForm({
      provider_name: provider.provider_name,
      api_key: '',
      display_name: provider.display_name ?? '',
      base_url: provider.base_url ?? '',
      priority: provider.priority,
      notes: provider.notes ?? '',
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {providers?.length ?? 0} provider{(providers?.length ?? 0) !== 1 ? 's' : ''} configured
        </p>
        <Button
          className="gap-2"
          onClick={() => {
            setProviderForm(DEFAULT_PROVIDER_FORM);
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="bg-muted/50 h-20" />
            </Card>
          ))}
        </div>
      ) : providers && providers.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Display Name</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">RPM</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">TPM</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className="border-border border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                      {provider.provider_name}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {provider.display_name || <span className="text-muted-foreground">--</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-foreground">
                      {provider.priority}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={provider.is_active ? 'default' : 'outline'} className={cn(provider.is_active && 'bg-green-600 hover:bg-green-600')}>
                        {provider.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                      {provider.rpm_limit ?? '--'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                      {provider.tpm_limit ?? '--'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: provider.id,
                              is_active: !provider.is_active,
                            })
                          }
                          disabled={toggleActiveMutation.isPending}
                          title={provider.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {provider.is_active ? (
                            <PowerOff className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <Power className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(provider)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (confirm(`Delete provider "${provider.provider_name}"?`)) {
                              deleteMutation.mutate(provider.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center text-sm">
              No providers configured yet. Add your first provider to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Provider Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Provider</DialogTitle>
            <CardDescription>Configure a new LLM provider with API credentials.</CardDescription>
          </DialogHeader>
          <ProviderForm
            form={providerForm}
            setForm={setProviderForm}
            onSubmit={() => createMutation.mutate(providerForm)}
            isPending={createMutation.isPending}
            submitLabel="Add Provider"
            isCreate
          />
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog open={editProvider != null} onOpenChange={(open) => !open && setEditProvider(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
            <CardDescription>Update provider settings. Leave API key blank to keep existing.</CardDescription>
          </DialogHeader>
          {editProvider && (
            <ProviderForm
              form={providerForm}
              setForm={setProviderForm}
              onSubmit={() => {
                const data: UpdateProviderRequest = {
                  display_name: providerForm.display_name || undefined,
                  base_url: providerForm.base_url || undefined,
                  priority: providerForm.priority,
                  notes: providerForm.notes || undefined,
                };
                if (providerForm.api_key) data.api_key = providerForm.api_key;
                updateMutation.mutate({ id: editProvider.id, data });
              }}
              isPending={updateMutation.isPending}
              submitLabel="Save"
              isCreate={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProviderForm({
  form,
  setForm,
  onSubmit,
  isPending,
  submitLabel,
  isCreate,
}: {
  form: CreateProviderRequest;
  setForm: React.Dispatch<React.SetStateAction<CreateProviderRequest>>;
  onSubmit: () => void;
  isPending: boolean;
  submitLabel: string;
  isCreate: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-4 px-6 py-2">
        <div>
          <label className={labelClass}>Provider Name</label>
          <select
            value={form.provider_name}
            onChange={(e) => setForm((f) => ({ ...f, provider_name: e.target.value }))}
            className={selectClass}
            disabled={!isCreate}
          >
            {PROVIDER_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>API Key {!isCreate && <span className="text-muted-foreground">(leave blank to keep)</span>}</label>
          <input
            type="password"
            value={form.api_key}
            onChange={(e) => setForm((f) => ({ ...f, api_key: e.target.value }))}
            className={inputClass}
            placeholder="sk-..."
            required={isCreate}
          />
        </div>
        <div>
          <label className={labelClass}>Display Name</label>
          <input
            value={form.display_name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            className={inputClass}
            placeholder="e.g., OpenAI Production"
          />
        </div>
        <div>
          <label className={labelClass}>Base URL</label>
          <input
            value={form.base_url ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
            className={inputClass}
            placeholder="https://api.openai.com/v1 (optional)"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Priority</label>
            <input
              type="number"
              value={form.priority ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, priority: parseInt(e.target.value) || 0 }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>RPM Limit</label>
            <input
              type="number"
              value={form.rpm_limit ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, rpm_limit: e.target.value ? parseInt(e.target.value) : undefined }))}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className={cn(inputClass, 'min-h-[60px] resize-y')}
            placeholder="Optional notes..."
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending || (isCreate && !form.api_key.trim())}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: MODELS
// ═══════════════════════════════════════════════════════════════════════════════

function ModelsTab() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [modelForm, setModelForm] = useState<CreateModelRequest>(DEFAULT_MODEL_FORM);
  const [filterProvider, setFilterProvider] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deprecateTarget, setDeprecateTarget] = useState<LLMModel | null>(null);
  const [deprecateReason, setDeprecateReason] = useState('');

  const { data: models, isLoading } = useQuery({
    queryKey: queryKeys.llmConfig.models,
    queryFn: () => adminLLMConfigService.listModels({ active_only: false }),
  });

  const { data: providers } = useQuery({
    queryKey: queryKeys.llmConfig.providers,
    queryFn: () => adminLLMConfigService.listProviders(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateModelRequest) => adminLLMConfigService.createModel(data),
    onSuccess: () => {
      setCreateOpen(false);
      setModelForm(DEFAULT_MODEL_FORM);
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const deprecateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminLLMConfigService.deprecateModel(id, reason),
    onSuccess: () => {
      setDeprecateTarget(null);
      setDeprecateReason('');
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const undeprecateMutation = useMutation({
    mutationFn: (id: number) => adminLLMConfigService.undeprecateModel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const filteredModels = useMemo(() => {
    if (!models) return [];
    return models.filter((m) => {
      if (filterProvider && m.provider_name !== filterProvider) return false;
      if (filterCategory && m.category !== filterCategory) return false;
      return true;
    });
  }, [models, filterProvider, filterCategory]);

  const uniqueProviders = useMemo(() => {
    if (!models) return [];
    return [...new Set(models.map((m) => m.provider_name))].sort();
  }, [models]);

  const uniqueCategories = useMemo(() => {
    if (!models) return [];
    return [...new Set(models.map((m) => m.category).filter(Boolean))].sort() as string[];
  }, [models]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="border-input bg-background rounded-lg border px-3 py-1.5 text-sm"
          >
            <option value="">All Providers</option>
            {uniqueProviders.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border-input bg-background rounded-lg border px-3 py-1.5 text-sm"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {(filterProvider || filterCategory) && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => {
                setFilterProvider('');
                setFilterCategory('');
              }}
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
          <span className="text-muted-foreground text-xs">
            {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setModelForm({
              ...DEFAULT_MODEL_FORM,
              provider_name: providers?.[0]?.provider_name ?? '',
            });
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Register Model
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="bg-muted/50 h-20" />
            </Card>
          ))}
        </div>
      ) : filteredModels.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Model ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Display Name</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Tier</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Capabilities</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cost / 1M</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr
                    key={model.id}
                    className={cn(
                      'border-border border-b last:border-0 hover:bg-muted/20',
                      model.is_deprecated && 'opacity-60'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground max-w-[200px] truncate">
                      {model.model_id}
                    </td>
                    <td className="px-4 py-3 text-foreground text-xs">
                      {model.provider_name}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {model.display_name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {model.category ? (
                        <Badge variant="outline" className="text-xs">{model.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {model.quality_tier ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            model.quality_tier === 'premium' && 'border-yellow-500/50 text-yellow-600',
                            model.quality_tier === 'standard' && 'border-blue-500/50 text-blue-600',
                            model.quality_tier === 'economy' && 'border-green-500/50 text-green-600'
                          )}
                        >
                          {model.quality_tier}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {model.is_deprecated ? (
                        <Badge variant="outline" className="border-red-500/50 text-red-500 text-xs">Deprecated</Badge>
                      ) : model.is_active ? (
                        <Badge className="bg-green-600 hover:bg-green-600 text-xs">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {model.supports_vision && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <Eye className="mr-0.5 h-2.5 w-2.5" />vision
                          </Badge>
                        )}
                        {model.supports_tools && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <Wrench className="mr-0.5 h-2.5 w-2.5" />tools
                          </Badge>
                        )}
                        {model.supports_streaming && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <Zap className="mr-0.5 h-2.5 w-2.5" />stream
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      <div>
                        {model.cost_per_1m_input != null ? `$${model.cost_per_1m_input.toFixed(2)} in` : '--'}
                      </div>
                      <div>
                        {model.cost_per_1m_output != null ? `$${model.cost_per_1m_output.toFixed(2)} out` : '--'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {model.is_deprecated ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => undeprecateMutation.mutate(model.id)}
                            disabled={undeprecateMutation.isPending}
                          >
                            <Sparkles className="h-3 w-3" />
                            Restore
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs text-yellow-600 hover:text-yellow-700"
                            onClick={() => setDeprecateTarget(model)}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Deprecate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center text-sm">
              {models && models.length > 0
                ? 'No models match the current filters.'
                : 'No models registered yet. Register your first model.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Model Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register Model</DialogTitle>
            <CardDescription>Add a new LLM model to the registry.</CardDescription>
          </DialogHeader>
          <ModelForm
            form={modelForm}
            setForm={setModelForm}
            providers={providers ?? []}
            onSubmit={() => createMutation.mutate(modelForm)}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Deprecate Model Dialog */}
      <Dialog open={deprecateTarget != null} onOpenChange={(open) => !open && setDeprecateTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Deprecate Model</DialogTitle>
            <CardDescription>
              Deprecating <strong className="font-mono">{deprecateTarget?.model_id}</strong> will prevent it from being assigned to new stages.
            </CardDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (deprecateTarget) {
                deprecateMutation.mutate({ id: deprecateTarget.id, reason: deprecateReason });
              }
            }}
          >
            <div className="px-6 py-2">
              <label className={labelClass}>Reason for deprecation</label>
              <textarea
                value={deprecateReason}
                onChange={(e) => setDeprecateReason(e.target.value)}
                className={cn(inputClass, 'min-h-[60px] resize-y')}
                placeholder="e.g., Replaced by newer model version"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeprecateTarget(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={deprecateMutation.isPending || !deprecateReason.trim()}
              >
                Deprecate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ModelForm({
  form,
  setForm,
  providers,
  onSubmit,
  isPending,
}: {
  form: CreateModelRequest;
  setForm: React.Dispatch<React.SetStateAction<CreateModelRequest>>;
  providers: LLMProvider[];
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-4 px-6 py-2">
        <div>
          <label className={labelClass}>Model ID</label>
          <input
            value={form.model_id}
            onChange={(e) => setForm((f) => ({ ...f, model_id: e.target.value }))}
            className={inputClass}
            placeholder="e.g., gpt-4o-2024-08-06"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Provider</label>
            <select
              value={form.provider_name}
              onChange={(e) => setForm((f) => ({ ...f, provider_name: e.target.value }))}
              className={selectClass}
              required
            >
              <option value="">Select provider</option>
              {providers.map((p) => (
                <option key={p.id} value={p.provider_name}>
                  {p.display_name || p.provider_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Display Name</label>
            <input
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              className={inputClass}
              placeholder="e.g., GPT-4o"
              required
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={inputClass}
            placeholder="Optional description"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <input
              value={form.category ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={inputClass}
              placeholder="e.g., chat, reasoning"
            />
          </div>
          <div>
            <label className={labelClass}>Quality Tier</label>
            <select
              value={form.quality_tier ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, quality_tier: e.target.value || undefined }))}
              className={selectClass}
            >
              <option value="">None</option>
              <option value="premium">Premium</option>
              <option value="standard">Standard</option>
              <option value="economy">Economy</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Cost / 1M Input ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.cost_per_1m_input ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, cost_per_1m_input: e.target.value ? parseFloat(e.target.value) : undefined }))}
              className={inputClass}
              placeholder="e.g., 2.50"
            />
          </div>
          <div>
            <label className={labelClass}>Cost / 1M Output ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.cost_per_1m_output ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, cost_per_1m_output: e.target.value ? parseFloat(e.target.value) : undefined }))}
              className={inputClass}
              placeholder="e.g., 10.00"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Max Context Tokens</label>
            <input
              type="number"
              value={form.max_context_tokens ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, max_context_tokens: e.target.value ? parseInt(e.target.value) : undefined }))}
              className={inputClass}
              placeholder="e.g., 128000"
            />
          </div>
          <div>
            <label className={labelClass}>Max Output Tokens</label>
            <input
              type="number"
              value={form.max_output_tokens ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, max_output_tokens: e.target.value ? parseInt(e.target.value) : undefined }))}
              className={inputClass}
              placeholder="e.g., 4096"
            />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <label className={cn(labelClass, 'mb-2')}>Capabilities</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['supports_vision', 'Vision'],
                ['supports_tools', 'Tool Use'],
                ['supports_streaming', 'Streaming'],
                ['supports_json_mode', 'JSON Mode'],
                ['supports_web_search', 'Web Search'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(form[key] as boolean) ?? false}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="rounded border"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending || !form.model_id.trim() || !form.provider_name || !form.display_name.trim()}>
          Register Model
        </Button>
      </DialogFooter>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: QC STAGE MODELS
// ═══════════════════════════════════════════════════════════════════════════════

function QCStagesTab() {
  const queryClient = useQueryClient();
  const [overrideTarget, setOverrideTarget] = useState<QCStageDefault | null>(null);
  const [stageForm, setStageForm] = useState<CreateQCStageModelRequest>(DEFAULT_STAGE_OVERRIDE_FORM);

  const { data: stageDefaults, isLoading } = useQuery({
    queryKey: queryKeys.llmConfig.qcStageDefaults,
    queryFn: () => adminLLMConfigService.listQCStageDefaults(),
  });

  const { data: models } = useQuery({
    queryKey: queryKeys.llmConfig.models,
    queryFn: () => adminLLMConfigService.listModels({ active_only: false }),
  });

  const { data: stageModels } = useQuery({
    queryKey: queryKeys.llmConfig.qcStageModels,
    queryFn: () => adminLLMConfigService.listQCStageModels(),
  });

  const createOverrideMutation = useMutation({
    mutationFn: (data: CreateQCStageModelRequest) => adminLLMConfigService.createQCStageModel(data),
    onSuccess: () => {
      setOverrideTarget(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const updateOverrideMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { model?: string; fallback_model?: string; temperature?: number } }) =>
      adminLLMConfigService.updateQCStageModel(id, data),
    onSuccess: () => {
      setOverrideTarget(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: (id: number) => adminLLMConfigService.deleteQCStageModel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.llmConfig.all });
    },
  });

  const stages = stageDefaults?.stages ?? [];

  // Group stages by category
  const groupedStages = useMemo(() => {
    const groups: Record<string, QCStageDefault[]> = {};
    const categoryOrder = [...Object.keys(STAGE_CATEGORIES), 'Other'];
    for (const stage of stages) {
      const cat = getStageCategoryLabel(stage.stage);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(stage);
    }
    // Sort by predefined order
    const sorted: [string, QCStageDefault[]][] = [];
    for (const cat of categoryOrder) {
      if (groups[cat]) sorted.push([cat, groups[cat]]);
    }
    return sorted;
  }, [stages]);

  const openOverride = (stage: QCStageDefault) => {
    setOverrideTarget(stage);
    setStageForm({
      stage_name: stage.stage,
      model: stage.db_override ?? stage.default_model,
      fallback_model: '',
      temperature: 0.0,
    });
  };

  // Find the QCStageModel record for a given stage name (to get its id for update/delete)
  const findStageModelId = (stageName: string): number | null => {
    const match = stageModels?.find((m) => m.stage_name === stageName);
    return match?.id ?? null;
  };

  const handleOverrideSubmit = () => {
    if (!overrideTarget) return;
    const existingId = findStageModelId(overrideTarget.stage);
    if (existingId) {
      updateOverrideMutation.mutate({
        id: existingId,
        data: {
          model: stageForm.model,
          fallback_model: stageForm.fallback_model || undefined,
          temperature: stageForm.temperature,
        },
      });
    } else {
      createOverrideMutation.mutate(stageForm);
    }
  };

  const handleDeleteOverride = (stageName: string) => {
    const existingId = findStageModelId(stageName);
    if (existingId && confirm(`Remove override for "${stageName}"? It will revert to the default model.`)) {
      deleteOverrideMutation.mutate(existingId);
    }
  };

  const activeModels = useMemo(() => {
    return (models ?? []).filter((m) => m.is_active && !m.is_deprecated);
  }, [models]);

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {stageDefaults?.total ?? 0} stages configured, {stageDefaults?.overridden_count ?? 0} overridden
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="bg-muted/50 h-24" />
            </Card>
          ))}
        </div>
      ) : groupedStages.length > 0 ? (
        <div className="space-y-6">
          {groupedStages.map(([category, categoryStages]) => (
            <Card key={category}>
              <div className="border-border border-b bg-muted/30 px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">{category}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Stage</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Default Model</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Override</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Active Model</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryStages.map((stage) => (
                      <tr key={stage.stage} className="border-border border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                          {stage.stage}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {stage.default_model}
                        </td>
                        <td className="px-4 py-3">
                          {stage.db_override ? (
                            <Badge variant="outline" className="font-mono text-xs border-primary/50 text-primary">
                              {stage.db_override}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">--</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'font-mono text-xs font-semibold',
                              stage.is_overridden ? 'text-primary' : 'text-foreground'
                            )}
                          >
                            {stage.active_model}
                          </span>
                          {stage.is_overridden && (
                            <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 border-yellow-500/50 text-yellow-600">
                              overridden
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-xs"
                              onClick={() => openOverride(stage)}
                            >
                              <Pencil className="h-3 w-3" />
                              {stage.is_overridden ? 'Edit' : 'Override'}
                            </Button>
                            {stage.is_overridden && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-xs text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteOverride(stage.stage)}
                                disabled={deleteOverrideMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                                Revert
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center text-sm">
              No QC stage defaults found.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Override Model Dialog */}
      <Dialog open={overrideTarget != null} onOpenChange={(open) => !open && setOverrideTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {overrideTarget?.is_overridden ? 'Edit Override' : 'Override Model'}
            </DialogTitle>
            <CardDescription>
              Set a model override for stage <strong className="font-mono">{overrideTarget?.stage}</strong>.
              {!overrideTarget?.is_overridden && (
                <span className="block mt-1 text-xs">
                  Default: <span className="font-mono">{overrideTarget?.default_model}</span>
                </span>
              )}
            </CardDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOverrideSubmit();
            }}
          >
            <div className="space-y-4 px-6 py-2">
              <div>
                <label className={labelClass}>Model</label>
                <select
                  value={stageForm.model}
                  onChange={(e) => setStageForm((f) => ({ ...f, model: e.target.value }))}
                  className={selectClass}
                  required
                >
                  <option value="">Select model</option>
                  {activeModels.map((m) => (
                    <option key={m.id} value={m.model_id}>
                      {m.display_name} ({m.model_id})
                    </option>
                  ))}
                  {/* Allow custom model IDs not in registry */}
                  {stageForm.model && !activeModels.some((m) => m.model_id === stageForm.model) && (
                    <option value={stageForm.model}>{stageForm.model} (current)</option>
                  )}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fallback Model (optional)</label>
                <select
                  value={stageForm.fallback_model ?? ''}
                  onChange={(e) => setStageForm((f) => ({ ...f, fallback_model: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">No fallback</option>
                  {activeModels.map((m) => (
                    <option key={m.id} value={m.model_id}>
                      {m.display_name} ({m.model_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Temperature</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="2"
                  value={stageForm.temperature ?? 0}
                  onChange={(e) => setStageForm((f) => ({ ...f, temperature: parseFloat(e.target.value) || 0 }))}
                  className={inputClass}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOverrideTarget(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createOverrideMutation.isPending ||
                  updateOverrideMutation.isPending ||
                  !stageForm.model.trim()
                }
              >
                {overrideTarget?.is_overridden ? 'Update Override' : 'Set Override'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
