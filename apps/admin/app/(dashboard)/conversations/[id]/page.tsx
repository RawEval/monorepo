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
} from 'lucide-react';
import {
  adminConversationsService,
  type FailedConversationFullResponse,
  type FailedConversationQcDetailResponse,
  type ConversationMessage,
  type FailedPromptFinalObj,
} from '@/services/admin/conversations-service';
import { adminQcConfigService } from '@/services/admin/qc-config-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@raweval/ui/card';
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

type TabId = 'conversation' | 'failure' | 'qc';

export default function ConversationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params?.id === 'string' ? parseInt(params.id, 10) : NaN;
  const tabFromUrl = (searchParams?.get('tab') as TabId) || 'conversation';
  const [tab, setTab] = useState<TabId>(tabFromUrl === 'qc' ? 'qc' : tabFromUrl === 'failure' ? 'failure' : 'conversation');
  const [rerunOpen, setRerunOpen] = useState(false);
  const [rerunReason, setRerunReason] = useState('Admin re-run');
  const [rerunJudgeConfigId, setRerunJudgeConfigId] = useState<string>('');

  useEffect(() => {
    const t = searchParams?.get('tab') as TabId | null;
    if (t === 'qc' || t === 'failure' || t === 'conversation') setTab(t);
  }, [searchParams]);

  const isIdValid = Number.isInteger(id) && id > 0;

  const { data: fullData, isLoading: fullLoading, error: fullError, refetch: refetchFull } = useQuery({
    queryKey: queryKeys.conversations.full(id),
    queryFn: () => adminConversationsService.getFullConversation(id),
    enabled: isIdValid,
  });

  const { data: qcDetailData, isLoading: qcDetailLoading, error: qcDetailError } = useQuery({
    queryKey: queryKeys.conversations.qcDetail(id),
    queryFn: () => adminConversationsService.getQcDetail(id),
    enabled: isIdValid && tab === 'qc',
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.full(v.conversationId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.qcDetail(v.conversationId) });
    },
  });

  const handleRerunSubmit = () => {
    if (!isIdValid) return;
    rerunMutation.mutate({
      conversationId: id,
      reason: rerunReason,
      judgeConfigId: rerunJudgeConfigId ? parseInt(rerunJudgeConfigId, 10) : undefined,
    });
  };

  if (!isIdValid) {
    return (
      <div className="space-y-6">
        <Link href="/conversations" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to list
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
  const failedMessageId = fullData?.failed_prompt_final?.failed_message_id ?? null;
  const sessionStatus = conversation?.status ?? fullData?.failed_prompt_final?.status;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border bg-background/95 sticky top-0 z-10 flex shrink-0 flex-col gap-3 border-b px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/conversations"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <span className="text-muted-foreground">|</span>
            <h1 className="text-foreground font-mono text-lg font-bold sm:text-xl">
              Conversation #{id}
            </h1>
            {sessionStatus && (
              <Badge
                variant="outline"
                className={cn(
                  sessionStatus === 'failed' && 'border-destructive/50 bg-destructive/10 text-destructive'
                )}
              >
                {sessionStatus}
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setRerunOpen(true)}>
            <RefreshCcw className="h-4 w-4" />
            Re-run QC
          </Button>
        </div>
        {conversation && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {conversation.user_email && <span>{conversation.user_email}</span>}
            {conversation.user_full_name && <span>{conversation.user_full_name}</span>}
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
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border -mb-px">
          {(
            [
              { id: 'conversation' as TabId, label: 'Conversation', icon: FileJson },
              { id: 'failure' as TabId, label: 'Failure & QC', icon: AlertCircle },
              { id: 'qc' as TabId, label: 'QC Detail', icon: Layers },
            ] as const
          ).map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              type="button"
              onClick={() => {
                setTab(tabId);
                router.replace(`/conversations/${id}?tab=${tabId}`, { scroll: false });
              }}
              className={cn(
                'flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                tab === tabId
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
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
              <ErrorState message={fullError instanceof Error ? fullError.message : 'Failed to load conversation'} onRetry={() => refetchFull()} />
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
              <div className="bg-muted/30 mx-auto max-w-4xl animate-pulse rounded-lg p-8" />
            ) : fullError ? (
              <ErrorState message={fullError instanceof Error ? fullError.message : 'Failed to load'} onRetry={() => refetchFull()} />
            ) : fullData ? (
              <FailureQcView data={fullData} />
            ) : (
              <EmptyState />
            )}
          </>
        )}

        {tab === 'qc' && (
          <>
            {qcDetailLoading ? (
              <div className="bg-muted/30 mx-auto max-w-4xl animate-pulse rounded-lg p-8" />
            ) : qcDetailError ? (
              <ErrorState message={qcDetailError instanceof Error ? qcDetailError.message : 'Failed to load QC detail'} onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.conversations.qcDetail(id) })} />
            ) : qcDetailData ? (
              <QcDetailView data={qcDetailData} />
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
              Re-executes the QC pipeline. Creates a new QC version; old results are never overwritten.
            </p>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">Reason</label>
              <input
                type="text"
                value={rerunReason}
                onChange={(e) => setRerunReason(e.target.value)}
                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Admin re-run"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-medium">Judge config (optional)</label>
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
            <Button variant="outline" onClick={() => setRerunOpen(false)}>Cancel</Button>
            <Button onClick={handleRerunSubmit} disabled={rerunMutation.isPending || !rerunReason.trim()} className="gap-2">
              {rerunMutation.isPending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Re-run QC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
      <div className="flex justify-end">
        <div className="bg-muted h-12 w-1/2 max-w-sm animate-pulse rounded-2xl" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
      <AlertCircle className="text-destructive h-12 w-12" />
      <p className="text-muted-foreground max-w-md text-center text-sm">{message}</p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCcw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-16">
      <p className="text-muted-foreground text-sm">No data for this conversation.</p>
    </div>
  );
}

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

function MessageBubble({ message, isFailed }: { message: ConversationMessage; isFailed: boolean }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const meta = message.message_metadata;
  const markedFailed = meta?.marked_failed ?? false;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const time = message.created_at ? format(new Date(message.created_at), 'MMM d, h:mm a') : '';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex max-w-[90%] flex-col gap-1 sm:max-w-[85%] md:max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'group relative rounded-2xl px-4 py-2.5 shadow-sm sm:px-5 sm:py-3',
            isUser
              ? 'bg-muted text-foreground'
              : isFailed || markedFailed
                ? 'border-2 border-destructive/60 bg-destructive/5'
                : 'bg-card text-card-foreground border border-border'
          )}
        >
          {(isFailed || markedFailed) && (
            <div className="mb-2 flex items-center gap-1.5 text-destructive">
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
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content || '(empty)'}</p>
              {message.model && (
                <p className="text-muted-foreground mt-1 text-[11px] font-mono">
                  {message.model}
                  {message.provider && ` · ${message.provider}`}
                  {message.latency_ms != null && ` · ${message.latency_ms.toFixed(0)}ms`}
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
          <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-[10px]" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
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
        <span className="text-destructive text-sm font-semibold">Failure summary</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setExpanded((e) => !e)}>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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
          {fpf.qc_status && <Badge variant="outline">QC: {fpf.qc_status}</Badge>}
          {fpf.failed_model && <Badge variant="outline">{fpf.failed_model}</Badge>}
        </div>
      </div>
      {expanded && (
        <div className="mt-3 border-t border-destructive/20 pt-3">
          {fpf.original_prompt_text && (
            <div className="mb-2">
              <span className="text-muted-foreground text-xs font-medium">Original prompt text</span>
              <p className="text-foreground mt-0.5 rounded bg-muted/50 p-2 text-xs">{fpf.original_prompt_text}</p>
            </div>
          )}
          <pre className="text-muted-foreground max-h-48 overflow-auto rounded bg-muted/30 p-2 text-[10px]">
            {JSON.stringify(fpf, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function FailureQcView({ data }: { data: FailedConversationFullResponse }) {
  const [expandedRaw, setExpandedRaw] = useState(false);
  const fpf = data.failed_prompt_final;
  const fp = data.failed_prompt;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {fpf && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Failed prompt final</CardTitle>
            <CardDescription>{fpf.failure_reason ?? 'Failure details'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <Row label="Domain" value={fpf.domain} />
              <Row label="Subdomain" value={fpf.subdomain} />
              <Row label="Status" value={fpf.status} />
              <Row label="QC status" value={fpf.qc_status} />
              <Row label="Failed message ID" value={fpf.failed_message_id} />
              <Row label="Failed model" value={fpf.failed_model} />
              <Row label="Failed provider" value={fpf.failed_provider} />
            </div>
            {fpf.original_prompt_text && (
              <div>
                <span className="text-muted-foreground text-xs font-medium">Original prompt text</span>
                <p className="text-foreground mt-1 rounded border border-border bg-muted/30 p-3 text-sm">{fpf.original_prompt_text}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {fp && typeof fp === 'object' && Object.keys(fp).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Failed prompt (raw)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto rounded bg-muted/30 p-3 text-xs">{JSON.stringify(fp, null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      <div className="border-border overflow-hidden rounded-lg border">
        <button
          type="button"
          onClick={() => setExpandedRaw((e) => !e)}
          className="bg-muted/30 border-border flex w-full items-center justify-between border-b px-4 py-2 text-left text-sm font-medium"
        >
          Full response (raw)
          {expandedRaw ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expandedRaw && (
          <pre className="max-h-96 overflow-auto p-4 text-[10px]">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="font-medium">{String(value)}</p>
    </div>
  );
}

function QcDetailView({ data }: { data: FailedConversationQcDetailResponse }) {
  const shared = data.shared ?? {};
  const models = data.models ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Conversation #{data.conversation_id}</Badge>
        {data.session_status != null && <Badge variant="secondary">{data.session_status}</Badge>}
        {data.user_marked_failed != null && (
          <Badge variant={data.user_marked_failed ? 'destructive' : 'outline'}>
            User marked failed: {String(data.user_marked_failed)}
          </Badge>
        )}
        {data.total_models_evaluated != null && (
          <Badge variant="outline">Models evaluated: {data.total_models_evaluated}</Badge>
        )}
      </div>

      {Object.keys(shared).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shared context</CardTitle>
            <CardDescription>
              {shared.user_email && shared.user_full_name && `${shared.user_full_name} (${shared.user_email})`}
              {shared.workflow_name && ` · ${shared.workflow_name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <Row label="User ID" value={shared.user_id} />
              <Row label="Email" value={shared.user_email} />
              <Row label="Workflow" value={shared.workflow_name} />
              <Row label="Workflow type" value={shared.workflow_type} />
            </div>
            {(shared.user_messages as unknown[])?.length > 0 && (
              <div className="mt-4">
                <span className="text-muted-foreground text-xs font-medium">User messages</span>
                <div className="mt-1 space-y-2">
                  {(shared.user_messages as Array<{ content?: string; role?: string }>).map((m, i) => (
                    <div key={i} className="rounded border border-border bg-muted/20 p-2 text-xs">
                      {m.content}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {models.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-foreground text-sm font-semibold">Per-model QC</h3>
          {models.map((m, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {(m.model ?? m.model_name) ?? `Model ${idx + 1}`}
                  {m.provider && ` · ${m.provider}`}
                </CardTitle>
                {m.fpf && (
                  <CardDescription>
                    {(m.fpf as FailedPromptFinalObj).failure_reason}
                    {(m.fpf as FailedPromptFinalObj).qc_status && ` · QC: ${(m.fpf as FailedPromptFinalObj).qc_status}`}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {m.assistant_message?.content && (
                  <div>
                    <span className="text-muted-foreground text-xs font-medium">Assistant message</span>
                    <p className="text-foreground mt-1 rounded border border-border bg-muted/20 p-3 text-sm">{m.assistant_message.content}</p>
                  </div>
                )}
                {m.fpf && (
                  <div className="grid gap-2 text-xs sm:grid-cols-2">
                    <Row label="Domain" value={(m.fpf as FailedPromptFinalObj).domain} />
                    <Row label="Status" value={(m.fpf as FailedPromptFinalObj).status} />
                    <Row label="QC outcome" value={(m.fpf as FailedPromptFinalObj).qc_outcome} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
