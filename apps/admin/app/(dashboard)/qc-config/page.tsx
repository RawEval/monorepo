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
import { cn } from '@raweval/utils';
import type { QcConfig, QcConfigCreateRequest } from '@/services/admin/qc-config-service';

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
            pipeline.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Version
        </Button>
      </div>

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
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ThresholdItem label="Cohen's Kappa" value={config.min_cohen_kappa} />
                        <ThresholdItem label="Fleiss' Kappa" value={config.min_fleiss_kappa} />
                        <ThresholdItem label="Krippendorff" value={config.min_krippendorff} />
                        <ThresholdItem label="% Agreement" value={config.min_percentage_agreement} />
                        <ThresholdItem label="Consistency" value={config.consistency_threshold} />
                        <ThresholdItem label="Entropy Low" value={config.entropy_low_threshold} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                        <Settings2 className="text-primary h-4 w-4" /> Quality Bands
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ThresholdItem label="Excellent" value={config.threshold_excellent} />
                        <ThresholdItem label="Good" value={config.threshold_good} />
                        <ThresholdItem label="Acceptable" value={config.threshold_acceptable} />
                        <ThresholdItem label="Poor" value={config.threshold_poor} />
                      </div>
                      <div className="border-border bg-muted/20 rounded-lg border p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Auto Flag</span>
                          <Badge variant={config.auto_flag_enabled ? 'default' : 'outline'}>
                            {config.auto_flag_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Expected Annotators</span>
                          <span className="text-foreground font-mono font-bold">
                            {config.expected_annotator_count}
                          </span>
                        </div>
                        {config.weighting_strategy && (
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Weighting</span>
                            <span className="text-foreground font-mono text-xs">
                              {config.weighting_strategy}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
        <DialogContent className="max-w-lg">
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
        <DialogContent className="max-w-lg">
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
      <div className="space-y-4 px-6 py-2">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">Version label</label>
          <input
            value={form.version_label}
            onChange={(e) => setForm((f) => ({ ...f, version_label: e.target.value }))}
            className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">Description</label>
          <input
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
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
          <label htmlFor="is_active" className="text-sm">Set as active</label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumField label="Cohen Kappa" value={form.min_cohen_kappa} onChange={(v) => setForm((f) => ({ ...f, min_cohen_kappa: v }))} />
          <NumField label="Fleiss Kappa" value={form.min_fleiss_kappa} onChange={(v) => setForm((f) => ({ ...f, min_fleiss_kappa: v }))} />
          <NumField label="% Agreement" value={form.min_percentage_agreement} onChange={(v) => setForm((f) => ({ ...f, min_percentage_agreement: v }))} />
          <NumField label="Expected annotators" value={form.expected_annotator_count} onChange={(v) => setForm((f) => ({ ...f, expected_annotator_count: v }))} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setForm(DEFAULT_CREATE)}>Reset</Button>
        <Button type="submit" disabled={isPending || !form.version_label.trim()}>{submitLabel}</Button>
      </DialogFooter>
    </form>
  );
}

function NumField({ label, value, onChange }: { label: string; value?: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-muted-foreground mb-1 block text-xs font-medium">{label}</label>
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

function ThresholdItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card flex flex-col gap-1 rounded-md border p-3 shadow-sm">
      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {label}
      </span>
      <span className="text-foreground font-mono text-lg font-bold">
        {typeof value === 'number' ? value.toFixed(3) : 'N/A'}
      </span>
    </div>
  );
}
