'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Gavel,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Pencil,
  RefreshCcw,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  adminJudgeConfigService,
  type JudgeConfig,
  type JudgeConfigCreateRequest,
  type JudgeSpec,
  type JudgeRole,
} from '@/services/admin/judge-config-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

const JUDGE_ROLES: JudgeRole[] = [
  'process_verifier',
  'tool_strategy',
  'devils_advocate',
];

const DEFAULT_JUDGE_SPEC: JudgeSpec = {
  role: 'process_verifier',
  model: '',
  system_prompt: null,
  types: null,
  timeout: 60,
};

const DEFAULT_FORM: JudgeConfigCreateRequest = {
  version_label: '',
  description: '',
  is_active: false,
  default_timeout: 60,
  judges: JUDGE_ROLES.map((role) => ({ ...DEFAULT_JUDGE_SPEC, role })),
};

export default function JudgeConfigPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<JudgeConfig | null>(null);
  const [form, setForm] = useState<JudgeConfigCreateRequest>(DEFAULT_FORM);

  const { data: configList, isLoading } = useQuery({
    queryKey: queryKeys.judgeConfig.list,
    queryFn: () => adminJudgeConfigService.listJudgeConfigs(),
  });
  const configs = configList?.configs ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.judgeConfig.all });

  const activateMutation = useMutation({
    mutationFn: (id: number) =>
      adminJudgeConfigService.updateJudgeConfig(id, { is_active: true }),
    onSuccess: invalidate,
  });
  const createMutation = useMutation({
    mutationFn: (data: JudgeConfigCreateRequest) =>
      adminJudgeConfigService.createJudgeConfig(data),
    onSuccess: () => {
      setCreateOpen(false);
      setForm(DEFAULT_FORM);
      invalidate();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: JudgeConfigCreateRequest;
    }) => adminJudgeConfigService.updateJudgeConfig(id, data),
    onSuccess: () => {
      setEditConfig(null);
      invalidate();
    },
  });

  const openEdit = (config: JudgeConfig) => {
    setEditConfig(config);
    setForm({
      version_label: config.version_label ?? '',
      description: config.description ?? '',
      is_active: config.is_active,
      default_timeout: config.default_timeout,
      merge_strategy: config.merge_strategy,
      calibration_enabled: config.calibration_enabled,
      judges: config.judges.length
        ? config.judges
        : JUDGE_ROLES.map((role) => ({ ...DEFAULT_JUDGE_SPEC, role })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Judge Config
          </h1>
          <p className="text-muted-foreground">
            Manage judge panel configurations used by the QC pipeline.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New Config
        </Button>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : configs.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center text-sm">
              No judge configs found.
            </CardContent>
          </Card>
        ) : (
          configs.map((config) => (
            <Card
              key={config.id}
              className={cn(
                'overflow-hidden',
                config.is_active && 'ring-primary ring-1'
              )}
            >
              <CardHeader
                className={cn(
                  'bg-muted/30 pb-4',
                  config.is_active && 'bg-primary/5'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        config.is_active
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Gavel className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {config.version_label ?? `Config v${config.version}`}
                        </CardTitle>
                        {config.is_active && (
                          <Badge className="bg-primary hover:bg-primary gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {config.description ||
                          `${config.judge_count} judges · ${config.merge_strategy}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!config.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => activateMutation.mutate(config.id)}
                        disabled={activateMutation.isPending}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => openEdit(config)}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedId(
                          expandedId === config.id ? null : config.id
                        )
                      }
                    >
                      {expandedId === config.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedId === config.id && (
                <CardContent className="border-border/50 border-t p-6">
                  <div className="mb-4 grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Default timeout
                      </p>
                      <p className="font-mono font-bold">
                        {config.default_timeout}s
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Merge strategy
                      </p>
                      <p className="font-mono font-bold">
                        {config.merge_strategy}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Calibration
                      </p>
                      <p className="font-mono font-bold">
                        {config.calibration_enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <h4 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                    Judges
                  </h4>
                  <div className="space-y-3">
                    {config.judges.map((j, ji) => (
                      <div
                        key={ji}
                        className="border-border space-y-1 rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px]"
                          >
                            {j.role}
                          </Badge>
                          <span className="font-mono text-sm">{j.model}</span>
                          {j.timeout && (
                            <span className="text-muted-foreground ml-auto text-xs">
                              {j.timeout}s
                            </span>
                          )}
                        </div>
                        {j.types && j.types.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {j.types.map((t) => (
                              <Badge
                                key={t}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Judge Config</DialogTitle>
          </DialogHeader>
          <JudgeConfigForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.version_label?.trim()}
            >
              {createMutation.isPending ? (
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editConfig != null}
        onOpenChange={(open) => !open && setEditConfig(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Judge Config</DialogTitle>
          </DialogHeader>
          {editConfig && <JudgeConfigForm form={form} setForm={setForm} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditConfig(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                editConfig &&
                updateMutation.mutate({ id: editConfig.id, data: form })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JudgeConfigForm({
  form,
  setForm,
}: {
  form: JudgeConfigCreateRequest;
  setForm: React.Dispatch<React.SetStateAction<JudgeConfigCreateRequest>>;
}) {
  const updateJudge = (idx: number, patch: Partial<JudgeSpec>) => {
    setForm((f) => {
      const judges = [...(f.judges ?? [])];
      judges[idx] = { ...judges[idx], ...patch } as JudgeSpec;
      return { ...f, judges };
    });
  };
  const addJudge = () =>
    setForm((f) => ({
      ...f,
      judges: [...(f.judges ?? []), { ...DEFAULT_JUDGE_SPEC }],
    }));
  const removeJudge = (idx: number) =>
    setForm((f) => ({
      ...f,
      judges: (f.judges ?? []).filter((_, i) => i !== idx),
    }));

  return (
    <div className="space-y-5 px-1 py-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Version label *
          </label>
          <input
            value={form.version_label ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, version_label: e.target.value }))
            }
            className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Default timeout (s)
          </label>
          <input
            type="number"
            min={5}
            max={300}
            value={form.default_timeout ?? 60}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                default_timeout: parseInt(e.target.value, 10) || 60,
              }))
            }
            className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Description
          </label>
          <input
            value={form.description ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active_jc"
            checked={form.is_active ?? false}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_active: e.target.checked }))
            }
            className="rounded border"
          />
          <label htmlFor="is_active_jc" className="text-sm">
            Set as active
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="calibration"
            checked={form.calibration_enabled ?? false}
            onChange={(e) =>
              setForm((f) => ({ ...f, calibration_enabled: e.target.checked }))
            }
            className="rounded border"
          />
          <label htmlFor="calibration" className="text-sm">
            Calibration enabled
          </label>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Judges ({form.judges?.length ?? 0})
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={addJudge}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {(form.judges ?? []).map((judge, i) => (
            <div
              key={i}
              className="border-border space-y-3 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">
                  Judge {i + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeJudge(i)}
                >
                  <Trash2 className="text-destructive h-3 w-3" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1 block text-[10px] font-medium">
                    Role
                  </label>
                  <select
                    value={judge.role}
                    onChange={(e) =>
                      updateJudge(i, { role: e.target.value as JudgeRole })
                    }
                    className="border-input bg-background w-full rounded border px-2 py-1.5 text-sm"
                  >
                    {JUDGE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-[10px] font-medium">
                    Model
                  </label>
                  <input
                    value={judge.model}
                    onChange={(e) => updateJudge(i, { model: e.target.value })}
                    placeholder="e.g. openai/gpt-4o"
                    className="border-input bg-background w-full rounded border px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-[10px] font-medium">
                    Timeout (s)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={judge.timeout ?? ''}
                    onChange={(e) =>
                      updateJudge(i, {
                        timeout: parseInt(e.target.value, 10) || null,
                      })
                    }
                    className="border-input bg-background w-full rounded border px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
