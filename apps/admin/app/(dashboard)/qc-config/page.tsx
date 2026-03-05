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
import { cn } from '@raweval/utils';

export default function QcConfigPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: configs, isLoading } = useQuery({
    queryKey: queryKeys.qcConfig.list,
    queryFn: () => adminQcConfigService.listQcConfigs(),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) =>
      adminQcConfigService.updateQcConfig(id, { is_active: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.qcConfig.all });
    },
  });

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
        <Button className="gap-2">
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
        ) : configs && Array.isArray(configs) ? (
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
