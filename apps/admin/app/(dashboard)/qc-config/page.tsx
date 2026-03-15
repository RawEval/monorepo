'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Settings2,
  Zap,
  Pencil,
  Info,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { adminQcConfigService } from '@/services/admin/qc-config-service';
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
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@raweval/utils';
import type { QcConfig, QcConfigCreateRequest } from '@/services/admin/qc-config-service';
import { QC_CONFIG_META } from '@/lib/qc-constants';

const DEFAULT_CREATE: QcConfigCreateRequest = {
  version_label: '',
  description: '',
  is_active: false,
  min_cohen_kappa: 0.4,
  min_fleiss_kappa: 0.4,
  min_krippendorff: 0.4,
  min_percentage_agreement: 0.6,
  consistency_threshold: 0.5,
  threshold_excellent: 0.8,
  threshold_good: 0.6,
  threshold_acceptable: 0.4,
  threshold_poor: 0.2,
  auto_flag_enabled: true,
  entropy_low_threshold: 0.3,
  expected_annotator_count: 9,
};

export default function QcConfigPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<QcConfig | null>(null);
  const [form, setForm] = useState<QcConfigCreateRequest>(DEFAULT_CREATE);

  const { data: configList, isLoading } = useQuery({
    queryKey: queryKeys.qcConfig.list,
    queryFn: () => adminQcConfigService.listQcConfigs(),
  });

  const configs = configList?.configs ?? [];

  const activateMutation = useMutation({
    mutationFn: (id: number) =>
      adminQcConfigService.updateQcConfig(id, { is_active: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.qcConfig.all });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: QcConfigCreateRequest) =>
      adminQcConfigService.createQcConfig(data),
    onSuccess: () => {
      setCreateOpen(false);
      setForm(DEFAULT_CREATE);
      void queryClient.invalidateQueries({ queryKey: queryKeys.qcConfig.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QcConfigCreateRequest> }) =>
      adminQcConfigService.updateQcConfig(id, data),
    onSuccess: () => {
      setEditConfig(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.qcConfig.all });
    },
  });

  const openEdit = (config: QcConfig) => {
    setEditConfig(config);
    setForm({
      version_label: config.version_label,
      description: config.description ?? '',
      is_active: config.is_active,
      min_cohen_kappa: config.min_cohen_kappa,
      min_fleiss_kappa: config.min_fleiss_kappa,
      min_krippendorff: config.min_krippendorff,
      min_percentage_agreement: config.min_percentage_agreement,
      consistency_threshold: config.consistency_threshold,
      threshold_excellent: config.threshold_excellent,
      threshold_good: config.threshold_good,
      threshold_acceptable: config.threshold_acceptable,
      threshold_poor: config.threshold_poor,
      auto_flag_enabled: config.auto_flag_enabled,
      entropy_low_threshold: config.entropy_low_threshold,
      expected_annotator_count: config.expected_annotator_count,
      collusion_min_repeat_batches: config.collusion_min_repeat_batches,
      outlier_disagreement_threshold: config.outlier_disagreement_threshold,
      tier_dominance_divergence_threshold: config.tier_dominance_divergence_threshold,
      consecutive_low_agreement_probation: config.consecutive_low_agreement_probation,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            QC Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage Quality Control thresholds and parameters for the evaluation
            pipeline. Each config version is immutable once created — create a new version to change settings.
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setForm(DEFAULT_CREATE); setCreateOpen(true); }}>
          <Plus className="h-4 w-4" />
          New Version
        </Button>
      </div>

      {/* Quick reference guide */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">How QC Config Works</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li><strong>IAA Thresholds</strong> — Minimum inter-annotator agreement scores. If annotations fall below these, the batch is flagged for review.</li>
                <li><strong>Quality Bands</strong> — Score ranges that classify QC verdict confidence (Excellent &gt; Good &gt; Acceptable &gt; Poor).</li>
                <li><strong>Auto Flag</strong> — When enabled, conversations breaching thresholds are automatically escalated without manual intervention.</li>
                <li><strong>Only one config can be active</strong> — Activating a config deactivates all others. Old configs remain for audit history.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="bg-muted/50 h-32" />
            </Card>
          ))
        ) : configs.length > 0 ? (
          configs.map((config) => (
            <Card
              key={config.id}
              className={cn(
                'overflow-hidden transition-all',
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
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold">
                          {config.version_label}
                        </CardTitle>
                        {config.is_active && (
                          <Badge className="bg-primary hover:bg-primary gap-1 shadow-sm">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {config.description || 'No description provided.'}
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
                        Set as Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => openEdit(config)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
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
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedId === config.id && (
                <CardContent className="border-border/50 border-t p-6 pt-6">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                        <Zap className="text-primary h-4 w-4" /> IAA Thresholds
                      </h4>
                      <p className="text-xs text-muted-foreground -mt-2">
                        Inter-Annotator Agreement minimums. Annotations below these are flagged.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ThresholdItem field="min_cohen_kappa" value={config.min_cohen_kappa} />
                        <ThresholdItem field="min_fleiss_kappa" value={config.min_fleiss_kappa} />
                        <ThresholdItem field="min_krippendorff" value={config.min_krippendorff} />
                        <ThresholdItem field="min_percentage_agreement" value={config.min_percentage_agreement} />
                        <ThresholdItem field="consistency_threshold" value={config.consistency_threshold} />
                        <ThresholdItem field="entropy_low_threshold" value={config.entropy_low_threshold} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                        <Settings2 className="text-primary h-4 w-4" /> Quality Bands
                      </h4>
                      <p className="text-xs text-muted-foreground -mt-2">
                        Score ranges that classify verdict confidence level.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ThresholdItem field="threshold_excellent" value={config.threshold_excellent} />
                        <ThresholdItem field="threshold_good" value={config.threshold_good} />
                        <ThresholdItem field="threshold_acceptable" value={config.threshold_acceptable} />
                        <ThresholdItem field="threshold_poor" value={config.threshold_poor} />
                      </div>
                      <div className="border-border bg-muted/20 rounded-lg border p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <Tooltip content={QC_CONFIG_META.auto_flag_enabled?.description || ''} side="right">
                            <span className="text-muted-foreground flex items-center gap-1 cursor-help">Auto Flag <Info className="h-3 w-3 text-muted-foreground/50" /></span>
                          </Tooltip>
                          <Badge variant={config.auto_flag_enabled ? 'default' : 'outline'}>
                            {config.auto_flag_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <Tooltip content={QC_CONFIG_META.expected_annotator_count?.description || ''} side="right">
                            <span className="text-muted-foreground flex items-center gap-1 cursor-help">Expected Annotators <Info className="h-3 w-3 text-muted-foreground/50" /></span>
                          </Tooltip>
                          <span className="text-foreground font-mono font-bold">
                            {config.expected_annotator_count}
                          </span>
                        </div>
                        {config.weighting_strategy && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Weighting</span>
                            <span className="text-foreground font-mono text-xs">
                              {config.weighting_strategy}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings Section */}
                  {(config.collusion_min_repeat_batches != null || config.outlier_disagreement_threshold != null || config.tier_dominance_divergence_threshold != null || config.consecutive_low_agreement_probation != null) && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold mb-3">
                        <AlertTriangle className="text-yellow-500 h-4 w-4" /> Advanced Anomaly Detection
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {config.collusion_min_repeat_batches != null && (
                          <ThresholdItem field="collusion_min_repeat_batches" value={config.collusion_min_repeat_batches} />
                        )}
                        {config.outlier_disagreement_threshold != null && (
                          <ThresholdItem field="outlier_disagreement_threshold" value={config.outlier_disagreement_threshold} />
                        )}
                        {config.tier_dominance_divergence_threshold != null && (
                          <ThresholdItem field="tier_dominance_divergence_threshold" value={config.tier_dominance_divergence_threshold} />
                        )}
                        {config.consecutive_low_agreement_probation != null && (
                          <ThresholdItem field="consecutive_low_agreement_probation" value={config.consecutive_low_agreement_probation} />
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center text-sm">
                No QC configurations found
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New QC configuration</DialogTitle>
            <CardDescription>
              Create a new versioned QC config. If you set as active, all others will be deactivated.
            </CardDescription>
          </DialogHeader>
          <QcConfigForm
            form={form}
            setForm={setForm}
            onSubmit={() => createMutation.mutate(form)}
            isPending={createMutation.isPending}
            submitLabel="Create"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editConfig != null} onOpenChange={(open) => !open && setEditConfig(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit QC configuration</DialogTitle>
            <CardDescription>
              Update thresholds and settings. Setting as active will deactivate all other configs.
            </CardDescription>
          </DialogHeader>
          {editConfig && (
            <QcConfigForm
              form={form}
              setForm={setForm}
              onSubmit={() => updateMutation.mutate({ id: editConfig.id, data: form })}
              isPending={updateMutation.isPending}
              submitLabel="Save"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QcConfigForm({
  form,
  setForm,
  onSubmit,
  isPending,
  submitLabel,
}: {
  form: QcConfigCreateRequest;
  setForm: React.Dispatch<React.SetStateAction<QcConfigCreateRequest>>;
  onSubmit: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-5 px-6 py-2">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">Version label</label>
          <input
            value={form.version_label}
            onChange={(e) => setForm((f) => ({ ...f, version_label: e.target.value }))}
            className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g., v2.1-stricter-kappa"
            required
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">Description</label>
          <input
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="What changed and why"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active ?? false}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="rounded border"
          />
          <label htmlFor="is_active" className="text-sm">Set as active <span className="text-xs text-muted-foreground">(deactivates all others)</span></label>
        </div>

        {/* IAA Thresholds */}
        <div className="border-t border-border pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" /> IAA Thresholds
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <NumFieldWithTip field="min_cohen_kappa" value={form.min_cohen_kappa} onChange={(v) => setForm((f) => ({ ...f, min_cohen_kappa: v }))} />
            <NumFieldWithTip field="min_fleiss_kappa" value={form.min_fleiss_kappa} onChange={(v) => setForm((f) => ({ ...f, min_fleiss_kappa: v }))} />
            <NumFieldWithTip field="min_percentage_agreement" value={form.min_percentage_agreement} onChange={(v) => setForm((f) => ({ ...f, min_percentage_agreement: v }))} />
            <NumFieldWithTip field="consistency_threshold" value={form.consistency_threshold} onChange={(v) => setForm((f) => ({ ...f, consistency_threshold: v }))} />
            <NumFieldWithTip field="min_krippendorff" value={form.min_krippendorff} onChange={(v) => setForm((f) => ({ ...f, min_krippendorff: v }))} />
            <NumFieldWithTip field="entropy_low_threshold" value={form.entropy_low_threshold} onChange={(v) => setForm((f) => ({ ...f, entropy_low_threshold: v }))} />
          </div>
        </div>

        {/* Quality Bands */}
        <div className="border-t border-border pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5 text-primary" /> Quality Bands
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <NumFieldWithTip field="threshold_excellent" value={form.threshold_excellent} onChange={(v) => setForm((f) => ({ ...f, threshold_excellent: v }))} />
            <NumFieldWithTip field="threshold_good" value={form.threshold_good} onChange={(v) => setForm((f) => ({ ...f, threshold_good: v }))} />
            <NumFieldWithTip field="threshold_acceptable" value={form.threshold_acceptable} onChange={(v) => setForm((f) => ({ ...f, threshold_acceptable: v }))} />
            <NumFieldWithTip field="threshold_poor" value={form.threshold_poor} onChange={(v) => setForm((f) => ({ ...f, threshold_poor: v }))} />
          </div>
        </div>

        {/* Operations */}
        <div className="border-t border-border pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" /> Operations
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <NumFieldWithTip field="expected_annotator_count" value={form.expected_annotator_count} onChange={(v) => setForm((f) => ({ ...f, expected_annotator_count: v }))} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setForm(DEFAULT_CREATE)}>Reset</Button>
        <Button type="submit" disabled={isPending || !form.version_label.trim()}>{submitLabel}</Button>
      </DialogFooter>
    </form>
  );
}

function NumFieldWithTip({ field, value, onChange }: { field: string; value?: number; onChange: (v: number) => void }) {
  const meta = QC_CONFIG_META[field];
  return (
    <div>
      <label className="text-muted-foreground mb-1 flex items-center gap-1 text-xs font-medium">
        {meta?.label || field}
        {meta?.description && (
          <Tooltip content={meta.description} side="top">
            <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
          </Tooltip>
        )}
      </label>
      <input
        type="number"
        step="0.01"
        value={value ?? ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}

function ThresholdItem({ field, value }: { field: string; value: number }) {
  const meta = QC_CONFIG_META[field];
  return (
    <div className="border-border bg-card flex flex-col gap-1 rounded-md border p-3 shadow-sm">
      <Tooltip content={meta?.description || field} side="top">
        <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase flex items-center gap-1 cursor-help">
          {meta?.label || field}
          <Info className="h-2.5 w-2.5 text-muted-foreground/40" />
        </span>
      </Tooltip>
      <span className="text-foreground font-mono text-lg font-bold">
        {typeof value === 'number' ? value.toFixed(3) : 'N/A'}
      </span>
    </div>
  );
}
