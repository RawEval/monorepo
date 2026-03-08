'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  RefreshCcw,
  FileJson,
  Layers,
  AlertCircle,
  XCircle,
  User,
  Bot,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Clock,
  GitBranch,
  CheckCircle2,
  Activity,
  DollarSign,
  Shield,
  Settings,
} from 'lucide-react';
import {
  adminConversationsService,
  type FailedConversationFullResponse,
  type FailedConversationQcDetailResponse,
  type ConversationMessage,
  type FailedPromptFinalObj,
  type StatusHistoryResponse,
  type AnnotationProgressResponse,
  type ConversationRubricResponse,
} from '@/services/admin/conversations-service';
import { adminQcConfigService } from '@/services/admin/qc-config-service';
import { adminPipelineService } from '@/services/admin/pipeline-service';
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
import { format } from 'date-fns';

type TabId = 'conversation' | 'failure' | 'qc' | 'rubric' | 'status';

export default function ConversationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params?.id === 'string' ? parseInt(params.id, 10) : NaN;
  const tabFromUrl = (searchParams?.get('tab') as TabId) || 'conversation';
  const [tab, setTab] = useState<TabId>(tabFromUrl);
  const [rerunOpen, setRerunOpen] = useState(false);
  const [rerunReason, setRerunReason] = useState('Admin re-run');
  const [rerunJudgeConfigId, setRerunJudgeConfigId] = useState<string>('');
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [transitionStatus, setTransitionStatus] = useState('');
  const [transitionReason, setTransitionReason] = useState('');
  const [annotConfigOpen, setAnnotConfigOpen] = useState(false);
  const [annotForm, setAnnotForm] = useState({
    tier_1_expert_count: 3,
    tier_2_expert_count: 3,
    tier_3_expert_count: 3,
    reviewer_pre_annotation_count: 0,
    reviewer_post_annotation_count: 0,
    reason: '',
  });

  useEffect(() => {
    const t = searchParams?.get('tab') as TabId | null;
    if (t) setTab(t);
  }, [searchParams]);

  const isIdValid = Number.isInteger(id) && id > 0;

  const {
    data: fullData,
    isLoading: fullLoading,
    error: fullError,
    refetch: refetchFull,
  } = useQuery({
    queryKey: queryKeys.conversations.full(id),
    queryFn: () => adminConversationsService.getFullConversation(id),
    enabled: isIdValid,
  });

  const {
    data: qcDetailData,
    isLoading: qcDetailLoading,
    error: qcDetailError,
  } = useQuery({
    queryKey: queryKeys.conversations.qcDetail(id),
    queryFn: () => adminConversationsService.getQcDetail(id),
    enabled: isIdValid && tab === 'qc',
  });

  const { data: rubricData, isLoading: rubricLoading } = useQuery({
    queryKey: queryKeys.conversations.rubric(id),
    queryFn: () => adminConversationsService.getRubric(id),
    enabled: isIdValid && tab === 'rubric',
  });

  const { data: statusHistoryData, isLoading: statusLoading } = useQuery({
    queryKey: queryKeys.conversations.statusHistory(id),
    queryFn: () => adminConversationsService.getStatusHistory(id),
    enabled: isIdValid && tab === 'status',
  });

  const { data: annotProgressData } = useQuery({
    queryKey: queryKeys.conversations.annotationProgress(id),
    queryFn: () => adminConversationsService.getAnnotationProgress(id),
    enabled: isIdValid && tab === 'failure',
  });

  const { data: statusDefs } = useQuery({
    queryKey: queryKeys.pipeline.taskStatusDefinitions,
    queryFn: () => adminPipelineService.getTaskStatusDefinitions(),
    enabled: transitionOpen,
  });

  const { data: qcConfigList } = useQuery({
    queryKey: queryKeys.qcConfig.list,
    queryFn: () => adminQcConfigService.listQcConfigs(),
    enabled: rerunOpen,
  });

  const rerunMutation = useMutation({
    mutationFn: ({
      conversationId,
      reason,
      judgeConfigId,
    }: {
      conversationId: number;
      reason: string;
      judgeConfigId?: number;
    }) =>
      adminConversationsService.rerunQC(conversationId, {
        reason,
        ...(judgeConfigId ? { judge_config_id: judgeConfigId } : {}),
      }),
    onSuccess: (_, v) => {
      setRerunOpen(false);
      setRerunReason('Admin re-run');
      setRerunJudgeConfigId('');
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.full(v.conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.qcDetail(v.conversationId),
      });
    },
  });

  const transitionMutation = useMutation({
    mutationFn: () =>
      adminConversationsService.transitionStatus(id, {
        new_status_code: transitionStatus,
        reason: transitionReason,
      }),
    onSuccess: () => {
      setTransitionOpen(false);
      setTransitionStatus('');
      setTransitionReason('');
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.full(id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.statusHistory(id),
      });
    },
  });

  const annotConfigMutation = useMutation({
    mutationFn: () =>
      adminConversationsService.updateAnnotationConfig(id, annotForm),
    onSuccess: () => {
      setAnnotConfigOpen(false);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.full(id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.annotationProgress(id),
      });
    },
  });

  // Sync annotation form when full data loads
  useEffect(() => {
    if (fullData?.annotation_config) {
      const c = fullData.annotation_config;
      setAnnotForm({
        tier_1_expert_count: c.tier_1_expert_count,
        tier_2_expert_count: c.tier_2_expert_count,
        tier_3_expert_count: c.tier_3_expert_count,
        reviewer_pre_annotation_count: c.reviewer_pre_annotation_count,
        reviewer_post_annotation_count: c.reviewer_post_annotation_count,
        reason: '',
      });
    }
  }, [fullData]);

  if (!isIdValid) {
    return (
      <div className="space-y-6">
        <Link
          href="/conversations"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to list
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="text-muted-foreground mx-auto mb-2 h-10 w-10" />
            <p className="text-muted-foreground">Invalid conversation ID.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const conversation = fullData?.conversation;
  const messages = conversation?.messages ?? [];
  const failedMessageId =
    fullData?.failed_prompt_final?.failed_message_id ?? null;
  const sessionStatus =
    conversation?.status ?? fullData?.failed_prompt_final?.status;

  const TABS = [
    { id: 'conversation' as TabId, label: 'Conversation', icon: FileJson },
    { id: 'failure' as TabId, label: 'Failure & QC', icon: AlertCircle },
    { id: 'qc' as TabId, label: 'QC Detail', icon: Layers },
    { id: 'rubric' as TabId, label: 'Rubric', icon: Shield },
    { id: 'status' as TabId, label: 'Status History', icon: GitBranch },
  ] as const;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border bg-background/95 sticky top-0 z-10 flex shrink-0 flex-col gap-2 border-b px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/conversations"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <span className="text-muted-foreground">|</span>
            <h1 className="text-foreground font-mono text-lg font-bold sm:text-xl">
              Conversation #{id}
            </h1>
            {sessionStatus && (
              <Badge
                variant="outline"
                className={cn(
                  sessionStatus === 'failed' &&
                    'border-destructive/50 bg-destructive/10 text-destructive'
                )}
              >
                {sessionStatus}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setTransitionOpen(true)}
            >
              <Activity className="h-4 w-4" /> Transition Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setAnnotConfigOpen(true)}
            >
              <Settings className="h-4 w-4" /> Annotation Config
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setRerunOpen(true)}
            >
              <RefreshCcw className="h-4 w-4" /> Re-run QC
            </Button>
          </div>
        </div>

        {conversation && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {conversation.user_email && <span>{conversation.user_email}</span>}
            {conversation.user_full_name && (
              <span>{conversation.user_full_name}</span>
            )}
            {conversation.failure_type && (
              <Badge variant="secondary" className="text-xs">
                {conversation.failure_type}
              </Badge>
            )}
            {conversation.user_marked_failed && (
              <span className="text-destructive">User marked failed</span>
            )}
            {conversation.qc_flagged && (
              <span className="text-destructive">QC flagged</span>
            )}
            {fullData?.cost_summary?.total_cost_usd != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />$
                {fullData.cost_summary.total_cost_usd.toFixed(4)}
              </span>
            )}
          </div>
        )}

        <div className="border-border -mb-px flex gap-1 overflow-x-auto border-b">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              type="button"
              onClick={() => {
                setTab(tabId);
                router.replace(`/conversations/${id}?tab=${tabId}`, {
                  scroll: false,
                });
              }}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                tab === tabId
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'conversation' && (
          <>
            {fullLoading ? (
              <ConversationSkeleton />
            ) : fullError ? (
              <ErrorState
                message={
                  fullError instanceof Error
                    ? fullError.message
                    : 'Failed to load'
                }
                onRetry={() => refetchFull()}
              />
            ) : !conversation?.messages?.length ? (
              <EmptyState />
            ) : (
              <ConversationThread
                messages={messages}
                failedMessageId={failedMessageId ?? undefined}
                failedPromptFinal={fullData?.failed_prompt_final ?? undefined}
                workflowName={conversation.workflow_name}
              />
            )}
          </>
        )}

        {tab === 'failure' && (
          <>
            {fullLoading ? (
              <LoadingBlock />
            ) : fullError ? (
              <ErrorState
                message={
                  fullError instanceof Error
                    ? fullError.message
                    : 'Failed to load'
                }
                onRetry={() => refetchFull()}
              />
            ) : fullData ? (
              <FailureQcView
                data={fullData}
                annotProgress={annotProgressData ?? null}
              />
            ) : (
              <EmptyState />
            )}
          </>
        )}

        {tab === 'qc' && (
          <>
            {qcDetailLoading ? (
              <LoadingBlock />
            ) : qcDetailError ? (
              <ErrorState
                message={
                  qcDetailError instanceof Error
                    ? qcDetailError.message
                    : 'Failed to load QC detail'
                }
                onRetry={() =>
                  queryClient.invalidateQueries({
                    queryKey: queryKeys.conversations.qcDetail(id),
                  })
                }
              />
            ) : qcDetailData ? (
              <QcDetailView data={qcDetailData} />
            ) : (
              <EmptyState />
            )}
          </>
        )}

        {tab === 'rubric' && (
          <>
            {rubricLoading ? (
              <LoadingBlock />
            ) : rubricData ? (
              <RubricView data={rubricData} />
            ) : (
              <EmptyState />
            )}
          </>
        )}

        {tab === 'status' && (
          <>
            {statusLoading ? (
              <LoadingBlock />
            ) : statusHistoryData ? (
              <StatusHistoryView data={statusHistoryData} />
            ) : (
              <EmptyState />
            )}
          </>
        )}
      </div>

      {/* Re-run QC Dialog */}
      <Dialog open={rerunOpen} onOpenChange={setRerunOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Re-run QC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-6 py-2">
            <p className="text-muted-foreground text-sm">
              Re-executes the QC pipeline. Old results are never overwritten
              (SCD Type 2).
            </p>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Reason
              </label>
              <input
                type="text"
                value={rerunReason}
                onChange={(e) => setRerunReason(e.target.value)}
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Admin re-run"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Judge config (optional)
              </label>
              <select
                value={rerunJudgeConfigId}
                onChange={(e) => setRerunJudgeConfigId(e.target.value)}
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Use active judge config</option>
                {(qcConfigList?.configs ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.version_label}
                    {c.is_active ? ' (active)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRerunOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                rerunMutation.mutate({
                  conversationId: id,
                  reason: rerunReason,
                  judgeConfigId: rerunJudgeConfigId
                    ? parseInt(rerunJudgeConfigId, 10)
                    : undefined,
                })
              }
              disabled={rerunMutation.isPending || !rerunReason.trim()}
              className="gap-2"
            >
              {rerunMutation.isPending ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}{' '}
              Re-run QC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transition Status Dialog */}
      <Dialog open={transitionOpen} onOpenChange={setTransitionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transition Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-6 py-2">
            <p className="text-muted-foreground text-sm">
              Move this conversation to a new lifecycle status. All transitions
              are audit-logged.
            </p>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                New status
              </label>
              <select
                value={transitionStatus}
                onChange={(e) => setTransitionStatus(e.target.value)}
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Select status…</option>
                {(Array.isArray(statusDefs) ? statusDefs : []).map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.display_name ?? s.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Reason
              </label>
              <textarea
                value={transitionReason}
                onChange={(e) => setTransitionReason(e.target.value)}
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                rows={3}
                placeholder="Reason for transition…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransitionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => transitionMutation.mutate()}
              disabled={transitionMutation.isPending || !transitionStatus}
              className="gap-2"
            >
              {transitionMutation.isPending ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}{' '}
              Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Annotation Config Dialog */}
      <Dialog open={annotConfigOpen} onOpenChange={setAnnotConfigOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Annotation Config</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-6 py-2">
            <p className="text-muted-foreground text-sm">
              Configure annotator tier quotas for this conversation.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  'tier_1_expert_count',
                  'tier_2_expert_count',
                  'tier_3_expert_count',
                  'reviewer_pre_annotation_count',
                  'reviewer_post_annotation_count',
                ] as const
              ).map((field) => (
                <div key={field}>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    {field.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={annotForm[field]}
                    onChange={(e) =>
                      setAnnotForm((f) => ({
                        ...f,
                        [field]: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">
                Reason
              </label>
              <input
                type="text"
                value={annotForm.reason}
                onChange={(e) =>
                  setAnnotForm((f) => ({ ...f, reason: e.target.value }))
                }
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Reason for change"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnotConfigOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => annotConfigMutation.mutate()}
              disabled={annotConfigMutation.isPending}
              className="gap-2"
            >
              {annotConfigMutation.isPending ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}{' '}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Skeleton / State helpers ─────────────────────────────────────────────────
function LoadingBlock() {
  return (
    <div className="bg-muted/30 m-6 mx-auto h-64 max-w-4xl animate-pulse rounded-lg" />
  );
}
function ConversationSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex justify-end">
        <div className="bg-muted h-16 w-3/4 max-w-md animate-pulse rounded-2xl" />
      </div>
      <div className="flex justify-start">
        <div className="bg-muted h-24 w-2/3 max-w-md animate-pulse rounded-2xl" />
      </div>
    </div>
  );
}
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
      <AlertCircle className="text-destructive h-12 w-12" />
      <p className="text-muted-foreground max-w-md text-center text-sm">
        {message}
      </p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCcw className="h-4 w-4" /> Retry
      </Button>
    </div>
  );
}
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-16">
      <p className="text-muted-foreground text-sm">
        No data for this conversation.
      </p>
    </div>
  );
}
function Row({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  if (value == null || value === '') return null;
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="text-sm font-medium">{String(value)}</p>
    </div>
  );
}

// ─── Conversation Tab ─────────────────────────────────────────────────────────
function ConversationThread({
  messages,
  failedMessageId,
  failedPromptFinal,
  workflowName,
}: {
  messages: ConversationMessage[];
  failedMessageId?: number;
  failedPromptFinal?: FailedPromptFinalObj | null;
  workflowName?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-1 px-4 py-6 sm:px-6">
      {workflowName && (
        <div className="text-muted-foreground mb-4 text-center text-xs font-medium">
          {workflowName}
        </div>
      )}
      {messages.map((msg) => {
        const isFailed = failedMessageId != null && msg.id === failedMessageId;
        return (
          <div key={msg.id} className="space-y-1">
            <MessageBubble message={msg} isFailed={isFailed} />
            {isFailed && failedPromptFinal && (
              <FailureCard fpf={failedPromptFinal} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MessageBubble({
  message,
  isFailed,
}: {
  message: ConversationMessage;
  isFailed: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const meta = message.message_metadata;
  const markedFailed = meta?.marked_failed ?? false;
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const time = message.created_at
    ? format(new Date(message.created_at), 'MMM d, h:mm a')
    : '';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex max-w-[90%] flex-col gap-1 sm:max-w-[85%] md:max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'group relative rounded-2xl px-4 py-2.5 shadow-sm sm:px-5 sm:py-3',
            isUser
              ? 'bg-muted text-foreground'
              : isFailed || markedFailed
                ? 'border-destructive/60 bg-destructive/5 border-2'
                : 'bg-card text-card-foreground border-border border'
          )}
        >
          {(isFailed || markedFailed) && (
            <div className="text-destructive mb-2 flex items-center gap-1.5">
              <XCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold">Marked as failed</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            {!isUser && (
              <div className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                {message.content || '(empty)'}
              </p>
              {message.model && (
                <p className="text-muted-foreground mt-1 font-mono text-[11px]">
                  {message.model}
                  {message.provider && ` · ${message.provider}`}
                  {message.latency_ms != null &&
                    ` · ${message.latency_ms.toFixed(0)}ms`}
                  {message.tokens_used != null &&
                    ` · ${message.tokens_used} tokens`}
                </p>
              )}
            </div>
            {isUser && (
              <div className="bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                <User className="text-muted-foreground h-4 w-4" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px]">{time}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-1.5 text-[10px]"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FailureCard({ fpf }: { fpf: FailedPromptFinalObj }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-destructive/40 bg-destructive/5 ml-0 rounded-xl border p-4 sm:ml-10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-destructive text-sm font-semibold">
          Failure summary
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          {expanded ? 'Less' : 'More'}
        </Button>
      </div>
      <div className="mt-2 space-y-1 text-sm">
        {fpf.failure_reason && (
          <p className="text-foreground font-medium">{fpf.failure_reason}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {fpf.domain && <Badge variant="secondary">{fpf.domain}</Badge>}
          {fpf.subdomain && <Badge variant="outline">{fpf.subdomain}</Badge>}
          {fpf.status && <Badge variant="outline">Status: {fpf.status}</Badge>}
          {fpf.qc_status && (
            <Badge variant="outline">QC: {fpf.qc_status}</Badge>
          )}
          {fpf.failed_model && (
            <Badge variant="outline">{fpf.failed_model}</Badge>
          )}
          {fpf.qc_outcome && (
            <Badge
              variant={
                fpf.qc_outcome === 'FailedPrompt' ? 'destructive' : 'outline'
              }
            >
              {fpf.qc_outcome}
            </Badge>
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-destructive/20 mt-3 border-t pt-3">
          {fpf.original_prompt_text && (
            <div className="mb-2">
              <span className="text-muted-foreground text-xs font-medium">
                Original prompt text
              </span>
              <p className="text-foreground bg-muted/50 mt-0.5 rounded p-2 text-xs">
                {fpf.original_prompt_text}
              </p>
            </div>
          )}
          <pre className="text-muted-foreground bg-muted/30 max-h-48 overflow-auto rounded p-2 text-[10px]">
            {JSON.stringify(fpf, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Failure & QC Tab ─────────────────────────────────────────────────────────
function FailureQcView({
  data,
  annotProgress,
}: {
  data: FailedConversationFullResponse;
  annotProgress: AnnotationProgressResponse | null;
}) {
  const [expandedRaw, setExpandedRaw] = useState(false);
  const fpf = data.failed_prompt_final;
  const cost = data.cost_summary;
  const timeline = data.timeline ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {fpf && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Failed Prompt Final</CardTitle>
            <CardDescription>
              {fpf.failure_reason ?? 'Failure details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3">
              <Row label="Domain" value={fpf.domain} />
              <Row label="Subdomain" value={fpf.subdomain} />
              <Row label="Status" value={fpf.status} />
              <Row label="QC Status" value={fpf.qc_status} />
              <Row label="QC Outcome" value={fpf.qc_outcome} />
              <Row label="Failed model" value={fpf.failed_model} />
              <Row label="Failed provider" value={fpf.failed_provider} />
              <Row label="Failed message ID" value={fpf.failed_message_id} />
              <Row
                label="Payout eligible"
                value={
                  fpf.payout_eligible != null
                    ? String(fpf.payout_eligible)
                    : null
                }
              />
              <Row
                label="Payout amount"
                value={
                  fpf.payout_amount != null ? `$${fpf.payout_amount}` : null
                }
              />
            </div>
            {fpf.original_prompt_text && (
              <div>
                <span className="text-muted-foreground text-xs font-medium">
                  Original prompt
                </span>
                <p className="text-foreground border-border bg-muted/30 mt-1 rounded border p-3 text-sm">
                  {fpf.original_prompt_text}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cost Summary */}
      {cost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Total Cost</p>
                <p className="text-foreground mt-1 font-mono text-xl font-bold">
                  ${(cost.total_cost_usd ?? 0).toFixed(4)}
                </p>
              </div>
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Total Tokens</p>
                <p className="text-foreground mt-1 font-mono text-xl font-bold">
                  {cost.total_tokens.toLocaleString()}
                </p>
                <p className="text-muted-foreground text-xs">
                  {cost.total_tokens_input} in / {cost.total_tokens_output} out
                </p>
              </div>
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Latency</p>
                <p className="text-foreground mt-1 font-mono text-xl font-bold">
                  {(cost.total_latency_ms / 1000).toFixed(1)}s
                </p>
                <p className="text-muted-foreground text-xs">
                  {cost.num_model_calls} model calls
                </p>
              </div>
            </div>
            {Object.keys(cost.cost_by_model).length > 0 && (
              <div className="mt-4">
                <p className="text-muted-foreground mb-2 text-xs font-medium">
                  Cost by model
                </p>
                <div className="space-y-1">
                  {Object.entries(cost.cost_by_model).map(([model, c]) => (
                    <div
                      key={model}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground font-mono text-xs">
                        {model}
                      </span>
                      <span className="font-mono">${c.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Annotation Progress */}
      {annotProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4" />
              Annotation Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['1', '2', '3'] as const).map((tier) => {
              const t = (
                annotProgress.tiers as Record<
                  string,
                  | {
                      needed: number;
                      completed: number;
                      percentage: number;
                      quota_met: boolean;
                    }
                  | undefined
                >
              )[`tier_${tier}`];
              if (!t) return null;
              return (
                <div key={tier} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Tier {tier}</span>
                    <span className="text-muted-foreground">
                      {t.completed}/{t.needed} ({t.percentage?.toFixed(0) ?? 0}
                      %)
                    </span>
                    {t.quota_met && (
                      <Badge className="h-5 text-[10px]">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Done
                      </Badge>
                    )}
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${t.percentage ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {annotProgress.overall_progress &&
              typeof annotProgress.overall_progress === 'object' &&
              'percentage' in annotProgress.overall_progress && (
                <div className="border-border border-t pt-3">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Overall</span>
                    <span>
                      {(
                        annotProgress.overall_progress as { percentage: number }
                      ).percentage?.toFixed(0) ?? 0}
                      %
                    </span>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary mt-1.5 h-2 w-2 rounded-full" />
                    {i < timeline.length - 1 && (
                      <div className="bg-border mt-1 w-px flex-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-muted-foreground text-xs">
                      {event.actor} ·{' '}
                      {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw data */}
      <div className="border-border overflow-hidden rounded-lg border">
        <button
          type="button"
          onClick={() => setExpandedRaw((e) => !e)}
          className="bg-muted/30 border-border flex w-full items-center justify-between border-b px-4 py-2 text-left text-sm font-medium"
        >
          Full response (raw){' '}
          {expandedRaw ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedRaw && (
          <pre className="max-h-96 overflow-auto p-4 text-[10px]">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── QC Detail Tab ────────────────────────────────────────────────────────────
function QcDetailView({ data }: { data: FailedConversationQcDetailResponse }) {
  const shared = data.shared ?? {};
  const models = data.models ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Conversation #{data.conversation_id}</Badge>
        {data.session_status != null && (
          <Badge variant="secondary">{data.session_status}</Badge>
        )}
        <Badge variant={data.user_marked_failed ? 'destructive' : 'outline'}>
          User marked: {String(data.user_marked_failed)}
        </Badge>
        <Badge variant="outline">
          Models evaluated: {data.total_models_evaluated}
        </Badge>
      </div>

      {/* Shared context */}
      {Object.keys(shared).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shared Context</CardTitle>
            <CardDescription>
              {shared.user_full_name}{' '}
              {shared.user_email && `(${shared.user_email})`}{' '}
              {shared.workflow_name && `· ${shared.workflow_name}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Row label="User ID" value={shared.user_id} />
              <Row label="Workflow" value={shared.workflow_name} />
              <Row label="Workflow type" value={shared.workflow_type} />
              <Row
                label="Web search"
                value={String(shared.web_search_enabled)}
              />
            </div>
            {shared.model_analysis && (
              <div>
                <span className="text-muted-foreground text-xs font-medium">
                  Model analysis
                </span>
                <p className="text-foreground border-border bg-muted/30 mt-1 rounded border p-3 text-sm">
                  {
                    (shared.model_analysis as { analysis_text?: string })
                      .analysis_text
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Per-model */}
      {models.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-foreground text-sm font-semibold">
            Per-Model QC Results
          </h3>
          {models.map((m, idx) => {
            const qcCase = m.qc_case;
            return (
              <Card key={idx}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    <Badge variant="outline">
                      {m.model ?? `Model ${idx + 1}`}
                    </Badge>
                    {m.provider && (
                      <span className="text-muted-foreground text-xs">
                        {m.provider}
                      </span>
                    )}
                    {qcCase?.verdict && (
                      <Badge
                        variant={
                          qcCase.verdict === 'FailedPrompt'
                            ? 'destructive'
                            : qcCase.verdict === 'FalsePositive'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {qcCase.verdict}
                      </Badge>
                    )}
                    {qcCase?.payout_eligible && (
                      <Badge className="bg-green-600 text-white">
                        Payout eligible
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {m.assistant_message?.content && (
                    <div>
                      <span className="text-muted-foreground text-xs font-medium">
                        Assistant response
                      </span>
                      <p className="text-foreground border-border bg-muted/20 mt-1 line-clamp-4 rounded border p-3 text-sm">
                        {m.assistant_message.content}
                      </p>
                    </div>
                  )}
                  {/* QC Case scores */}
                  {qcCase && (
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="border-border rounded-lg border p-3">
                        <p className="text-muted-foreground text-xs">
                          FP Score
                        </p>
                        <p className="font-mono text-lg font-bold">
                          {qcCase.fp_score?.toFixed(3) ?? 'N/A'}
                        </p>
                      </div>
                      <div className="border-border rounded-lg border p-3">
                        <p className="text-muted-foreground text-xs">
                          Process Score
                        </p>
                        <p className="font-mono text-lg font-bold">
                          {qcCase.process_score?.toFixed(3) ?? 'N/A'}
                        </p>
                      </div>
                      <div className="border-border rounded-lg border p-3">
                        <p className="text-muted-foreground text-xs">
                          D-Global
                        </p>
                        <p className="font-mono text-lg font-bold">
                          {qcCase.d_global?.toFixed(3) ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                  {qcCase?.root_cause && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        Root cause:
                      </span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {qcCase.root_cause}
                      </Badge>
                    </div>
                  )}
                  {qcCase?.verdict_reason && (
                    <div>
                      <span className="text-muted-foreground text-xs font-medium">
                        Verdict reason
                      </span>
                      <p className="mt-0.5 text-sm">{qcCase.verdict_reason}</p>
                    </div>
                  )}
                  {qcCase?.fraud_score != null && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        Fraud score:
                      </span>
                      <span
                        className={cn(
                          'font-mono text-sm font-bold',
                          qcCase.fraud_score > 0.4
                            ? 'text-destructive'
                            : 'text-foreground'
                        )}
                      >
                        {qcCase.fraud_score.toFixed(3)}
                      </span>
                      {qcCase.fraud_status && (
                        <Badge variant="outline" className="text-xs">
                          {qcCase.fraud_status}
                        </Badge>
                      )}
                    </div>
                  )}
                  {/* Judges */}
                  {m.qc_judges.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs font-medium">
                        Judge outputs
                      </p>
                      <div className="space-y-2">
                        {m.qc_judges.map((j, ji) => (
                          <div
                            key={ji}
                            className="border-border rounded-lg border p-3"
                          >
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="font-mono text-[10px]"
                              >
                                {j.judge_role}
                              </Badge>
                              <span className="text-muted-foreground font-mono text-xs">
                                {j.model_id}
                              </span>
                              <span className="font-mono font-bold">
                                {j.process_score?.toFixed(3) ?? 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Fraud signals */}
                  {m.qc_fraud_signals.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs font-medium">
                        Fraud signals
                      </p>
                      <div className="space-y-1">
                        {m.qc_fraud_signals.map((s, si) => (
                          <div
                            key={si}
                            className="border-border flex items-center justify-between rounded border px-3 py-2"
                          >
                            <span className="font-mono text-xs">
                              {s.signal_type}
                            </span>
                            <span
                              className={cn(
                                'font-mono text-xs font-bold',
                                (s.score ?? 0) > 0.4
                                  ? 'text-destructive'
                                  : 'text-foreground'
                              )}
                            >
                              {s.score?.toFixed(3)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Rubric criteria */}
                  {m.qc_rubric?.criteria && m.qc_rubric.criteria.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs font-medium">
                        Rubric criteria ({m.qc_rubric.criteria.length})
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="border-border border-b text-left">
                            <tr>
                              <th className="pr-3 pb-2">Criterion</th>
                              <th className="pr-3 pb-2">Type</th>
                              <th className="pr-3 pb-2">Status</th>
                              <th className="pr-3 pb-2">Score</th>
                              <th className="pb-2">Weight</th>
                            </tr>
                          </thead>
                          <tbody className="divide-border divide-y">
                            {m.qc_rubric.criteria.map((c, ci) => (
                              <tr key={ci}>
                                <td className="py-2 pr-3 font-medium">
                                  {c.name}
                                </td>
                                <td className="text-muted-foreground py-2 pr-3">
                                  {c.type}
                                </td>
                                <td className="py-2 pr-3">
                                  <Badge
                                    variant={
                                      c.status === 'CORRECT'
                                        ? 'default'
                                        : c.status === 'INCORRECT'
                                          ? 'destructive'
                                          : 'outline'
                                    }
                                    className="text-[10px]"
                                  >
                                    {c.status}
                                  </Badge>
                                </td>
                                <td className="py-2 pr-3 font-mono">
                                  {c.step_score?.toFixed(2) ?? '—'}
                                </td>
                                <td className="text-muted-foreground py-2">
                                  {c.weight?.toFixed(2) ?? '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Rubric Tab ───────────────────────────────────────────────────────────────
function RubricView({ data }: { data: ConversationRubricResponse }) {
  const rubric = data.rubric;
  const items = data.items ?? [];
  const verdictColors: Record<string, string> = {
    supported: 'bg-green-500/10 text-green-700 border-green-500/20',
    contradicted: 'bg-destructive/10 text-destructive border-destructive/20',
    insufficient_evidence:
      'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {rubric && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rubric Summary</CardTitle>
            {rubric.overall_failure_summary && (
              <CardDescription>
                {rubric.overall_failure_summary}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="border-border rounded-lg border p-3 text-center">
                <p className="text-muted-foreground text-xs">Total claims</p>
                <p className="font-mono text-2xl font-bold">
                  {rubric.total_claims_analyzed ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-center">
                <p className="text-xs text-green-700">Supported</p>
                <p className="font-mono text-2xl font-bold text-green-700">
                  {rubric.claims_supported ?? 0}
                </p>
              </div>
              <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-3 text-center">
                <p className="text-destructive text-xs">Contradicted</p>
                <p className="text-destructive font-mono text-2xl font-bold">
                  {rubric.claims_contradicted ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-center">
                <p className="text-xs text-yellow-700">Insufficient</p>
                <p className="font-mono text-2xl font-bold text-yellow-700">
                  {rubric.claims_insufficient ?? 0}
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Row label="Failure severity" value={rubric.failure_severity} />
              <Row
                label="Failure confidence"
                value={
                  rubric.failure_confidence != null
                    ? `${(rubric.failure_confidence * 100).toFixed(0)}%`
                    : null
                }
              />
              <Row
                label="Judge majority verdict"
                value={rubric.judge_majority_verdict}
              />
              <Row
                label="Primary attribution"
                value={rubric.primary_attribution}
              />
              <Row
                label="Behavioral score"
                value={rubric.behavioral_score?.toFixed(3) ?? null}
              />
              <Row
                label="Semantic entropy"
                value={rubric.semantic_entropy_score?.toFixed(3) ?? null}
              />
              <Row
                label="Payout eligible"
                value={
                  rubric.payout_eligible != null
                    ? String(rubric.payout_eligible)
                    : null
                }
              />
            </div>
            {rubric.annotator_focus_areas &&
              rubric.annotator_focus_areas.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2 text-xs font-medium">
                    Annotator focus areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rubric.annotator_focus_areas.map((a) => (
                      <Badge key={a} variant="secondary">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Atomic Claims ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-border divide-y">
              {items.map((item, i) => (
                <div key={item.id ?? i} className="space-y-2 p-4">
                  <div className="flex items-start gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 text-xs',
                        verdictColors[item.verdict ?? '']
                      )}
                    >
                      {item.verdict ?? 'unknown'}
                    </Badge>
                    <p className="text-sm font-medium">{item.claim_text}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-2">
                    {item.severity && (
                      <Badge variant="outline" className="text-[10px]">
                        {item.severity}
                      </Badge>
                    )}
                    {item.category && (
                      <Badge variant="outline" className="text-[10px]">
                        {item.category}
                      </Badge>
                    )}
                    {item.confidence != null && (
                      <span className="text-muted-foreground text-xs">
                        confidence: {(item.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                    {item.claim_source_turn != null && (
                      <span className="text-muted-foreground text-xs">
                        turn {item.claim_source_turn}
                      </span>
                    )}
                  </div>
                  {item.explanation && (
                    <p className="text-muted-foreground pl-2 text-xs">
                      {item.explanation}
                    </p>
                  )}
                  {item.evidence_text && (
                    <p className="border-border bg-muted/20 rounded border p-2 pl-2 text-xs">
                      {item.evidence_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Status History Tab ───────────────────────────────────────────────────────
function StatusHistoryView({ data }: { data: StatusHistoryResponse }) {
  const history = data.history ?? [];
  const phaseColors: Record<string, string> = {
    initial: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    analysis: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    annotation: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    qc: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    terminal: 'bg-green-500/10 text-green-700 border-green-500/20',
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Status Timeline ({data.total_transitions} transitions)
          </CardTitle>
          {data.current_status && (
            <CardDescription>
              Current:{' '}
              <span className="text-foreground font-medium">
                {data.current_status}
              </span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No transitions yet.
            </p>
          ) : (
            <div className="space-y-0">
              {history.map((entry, i) => (
                <div key={entry.id ?? i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary ring-background mt-3 h-2.5 w-2.5 rounded-full ring-2" />
                    {i < history.length - 1 && (
                      <div className="bg-border mt-1 w-px flex-1" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">
                        {entry.display_name ?? entry.status_code}
                      </span>
                      {entry.phase && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px]',
                            phaseColors[entry.phase] ?? ''
                          )}
                        >
                          {entry.phase}
                        </Badge>
                      )}
                    </div>
                    {entry.reason && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {entry.reason}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      {entry.triggered_by ?? 'system'}
                      {entry.created_at &&
                        ` · ${format(new Date(entry.created_at), 'MMM d, h:mm a')}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
