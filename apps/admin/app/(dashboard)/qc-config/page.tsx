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
import { adminQcConfigService } from '@/services/admin';
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
    queryKey: queryKeys.qcConfigs(),
    queryFn: () => adminQcConfigService.listQcConfigs(),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => adminQcConfigService.activateQcConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.qcConfigs() });
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
            Manage Quality Control thresholds and algorithmic parameters for the
            evaluation pipeline.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Version
        </Button>
      </div>

      <div className="grid gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="bg-muted/50 h-32" />
              </Card>
            ))
          : configs?.map((config) => (
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
                            {config.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] uppercase"
                          >
                            {config.version}
                          </Badge>
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
                      {/* Thresholds */}
                      <div className="space-y-4">
                        <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                          <Zap className="text-primary h-4 w-4" /> Algorithmic
                          Thresholds
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ThresholdItem
                            label="SBERT"
                            value={config.sbert_threshold}
                          />
                          <ThresholdItem
                            label="Cross Encoder"
                            value={config.cross_encoder_threshold}
                          />
                          <ThresholdItem
                            label="NLI Score"
                            value={config.nli_threshold}
                          />
                          <ThresholdItem
                            label="IAA (Kappa)"
                            value={config.iaa_threshold}
                          />
                          <ThresholdItem
                            label="Entropy"
                            value={config.entropy_threshold}
                          />
                        </div>
                      </div>

                      {/* Judge Config */}
                      <div className="space-y-4">
                        <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                          <Settings2 className="text-primary h-4 w-4" /> Judge
                          Consensus
                        </h4>
                        <div className="border-border bg-muted/20 rounded-lg border p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">
                              Judge Model Count
                            </span>
                            <span className="text-foreground font-mono text-sm font-bold">
                              {config.judge_model_count}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">
                              Majority Threshold
                            </span>
                            <span className="text-foreground font-mono text-sm font-bold">
                              {(config.judge_majority_threshold * 100).toFixed(
                                0
                              )}
                              %
                            </span>
                          </div>
                          <div className="bg-muted mt-4 h-1.5 w-full overflow-hidden rounded-full">
                            <div
                              className="bg-primary h-full"
                              style={{
                                width: `${config.judge_majority_threshold * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-border mt-8 flex justify-end gap-3 border-t pt-6">
                      <Button variant="outline" size="sm">
                        Modify Version
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        Delete Draft
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
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
        {value.toFixed(2)}
      </span>
    </div>
  );
}
