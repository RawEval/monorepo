'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, RefreshCcw, Layers, AlertCircle, XCircle, User, Bot,
  Clock, GitBranch, CheckCircle2, Activity, DollarSign,
  Shield, PieChart, ActivityIcon, Fingerprint, MessageSquareWarning,
  Info, AlertTriangle, TrendingUp, Ban, Eye
} from 'lucide-react';
import {
  adminConversationsService,
  type QcVersionEntry,
} from '@/services/admin/conversations-service';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@raweval/utils';
import { format } from 'date-fns';
import {
  FRAUD_SIGNAL_META,
  ATTRIBUTION_FIELDS,
  getVerdictTheme,
  getVerdictLabel,
  PIPELINE_STATUS_META,
} from '@/lib/qc-constants';

type TabId = 'overview' | 'rubric' | 'judges' | 'fraud' | 'holistic' | 'attribution' | 'entropy' | 'timeline';

const TABS: { id: TabId; label: string; icon: any; tip: string }[] = [
  { id: 'overview', label: 'Overview', icon: PieChart, tip: 'Summary scores, verdict, root cause, and payout status' },
  { id: 'rubric', label: 'Rubric', icon: Shield, tip: 'FActScore-style atomic claims decomposition with evidence mapping' },
  { id: 'judges', label: 'Judges', icon: Layers, tip: 'Individual LLM judge evaluations and majority verdict' },
  { id: 'fraud', label: 'Fraud', icon: Fingerprint, tip: '7-signal heuristic fraud detection (no LLM required)' },
  { id: 'holistic', label: 'Holistic', icon: ActivityIcon, tip: 'Deep semantic matching, completeness, and quality assessment' },
  { id: 'attribution', label: 'Attribution', icon: MessageSquareWarning, tip: 'Root cause probability breakdown — why the failure happened' },
  { id: 'entropy', label: 'Entropy', icon: GitBranch, tip: 'Semantic entropy: how consistent is the model across re-generations' },
  { id: 'timeline', label: 'Timeline', icon: Clock, tip: 'Pipeline execution history and status transitions' },
];

export default function ConversationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? parseInt(params.id, 10) : NaN;
  const tabFromUrl = (searchParams?.get('tab') as TabId) || 'overview';
  const [tab, setTab] = useState<TabId>(tabFromUrl);

  const isIdValid = Number.isInteger(id) && id > 0;

  const { data: pipelineStatus } = useQuery({
    queryKey: ['pipelineStatus', id],
    queryFn: () => adminConversationsService.getPipelineStatus(id),
    enabled: isIdValid,
    refetchInterval: (data: any) => data?.pipeline_stage !== 'complete' ? 4000 : false,
  });

  const {
    data: qcDetailData,
    isLoading: qcDetailLoading,
    error: qcDetailError,
    refetch,
  } = useQuery({
    queryKey: ['qcDetail', id],
    queryFn: () => adminConversationsService.getQcDetail(id),
    enabled: isIdValid,
  });

  const { data: attributionData } = useQuery({
    queryKey: ['failureAttribution', id],
    queryFn: () => adminConversationsService.getFailureAttribution(id),
    enabled: isIdValid && tab === 'attribution',
  });

  const { data: entropyData } = useQuery({
    queryKey: ['entropyDetails', id],
    queryFn: () => adminConversationsService.getEntropyDetails(id),
    enabled: isIdValid && tab === 'entropy',
  });

  const { data: qcVersionsData } = useQuery({
    queryKey: ['qcVersions', id],
    queryFn: () => adminConversationsService.getQcVersions(id),
    enabled: isIdValid && tab === 'overview',
  });

  const activeModelQueryVal = qcDetailData?.models?.[0]?.model;

  const { data: rubricData, isLoading: rubricLoading } = useQuery({
    queryKey: ['rubricDetails', id, activeModelQueryVal],
    queryFn: () => adminConversationsService.getAnalysisRubric(id, activeModelQueryVal || ''),
    enabled: isIdValid && tab === 'rubric' && !!activeModelQueryVal,
  });

  const { data: judgesData, isLoading: judgesLoading } = useQuery({
    queryKey: ['judgeDetails', id, activeModelQueryVal],
    queryFn: () => adminConversationsService.getJudgeDetails(id, activeModelQueryVal || ''),
    enabled: isIdValid && tab === 'judges' && !!activeModelQueryVal,
  });

  useEffect(() => {
    const t = searchParams?.get('tab') as TabId | null;
    if (t) setTab(t);
  }, [searchParams]);

  if (!isIdValid) {
    return (
      <div className="space-y-6 flex items-center justify-center h-full flex-col">
        <Link href="/conversations" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm">
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

  const handleTabChange = (t: TabId) => {
    setTab(t);
    router.replace(`/conversations/${id}?tab=${t}`, { scroll: false });
  };

  const shared = qcDetailData?.shared;
  const models = qcDetailData?.models || [];
  const activeModel = models[0];
  const qcCase = activeModel?.qc_case;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background overflow-hidden relative">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4 flex flex-col gap-3 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/conversations" className="text-muted-foreground hover:bg-muted/50 p-1.5 rounded-md transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold tracking-tight">Conversation #{id}</h1>
                {qcCase?.verdict && (
                  <Badge variant="outline" className={cn("px-2.5 py-0.5 uppercase tracking-wider text-[10px] font-bold", getVerdictTheme(qcCase.verdict))}>
                    {getVerdictLabel(qcCase.verdict)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 min-h-[20px]">
                {shared?.user?.email && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {shared.user.email}
                  </span>
                )}
                {qcDetailData?.session_status && (
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono bg-muted">{qcDetailData.session_status}</Badge>
                )}
                {pipelineStatus?.pipeline_stage && pipelineStatus.pipeline_stage !== 'complete' && (
                  <Badge variant="outline" className="text-[10px] ml-2 animate-pulse bg-blue-500/10 text-blue-600 border-blue-500/30">
                    <RefreshCcw className="h-3 w-3 mr-1 animate-spin" /> {PIPELINE_STATUS_META[pipelineStatus.pipeline_stage]?.label || pipelineStatus.pipeline_stage.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 shadow-sm">
                <RefreshCcw className={cn("h-4 w-4 mr-2", qcDetailLoading ? 'animate-spin' : '')} />
                Refresh
             </Button>
          </div>
        </div>
      </div>

      {qcDetailLoading ? (
        <div className="flex-1 flex items-center justify-center border border-border mt-4 mx-4 rounded-xl bg-card">
           <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
              <RefreshCcw className="h-8 w-8 text-primary/50 animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Loading Analysis data...</p>
           </div>
        </div>
      ) : qcDetailError ? (
        <div className="flex-1 flex flex-col items-center justify-center mt-4 mx-4 p-8 rounded-xl bg-destructive/5 border border-destructive/20">
           <AlertCircle className="h-10 w-10 text-destructive mb-3" />
           <p className="text-sm font-medium">Failed to load conversation details.</p>
           <Button variant="outline" onClick={() => refetch()} className="mt-4 border-destructive/30 hover:bg-destructive/10">Retry</Button>
        </div>
      ) : !qcDetailData ? (
        <div className="flex-1 flex items-center justify-center">No Data</div>
      ) : (
        <div className="flex-1 flex overflow-hidden w-full max-w-[100vw]">
          {/* LEFT PANEL: Conversation Viewer */}
          <div className="w-[35%] min-w-[350px] border-r border-border bg-card/50 flex flex-col z-0">
             <div className="px-5 py-3 border-b border-border/60 bg-muted/20 shrink-0">
                <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Conversation Thread
                </h3>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {shared?.user_messages?.map((msg, i) => (
                   <div key={`msg-user-${i}`} className="flex flex-col gap-1 items-end">
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">User</span>
                        <div className="bg-primary/10 text-primary h-5 w-5 rounded-md flex items-center justify-center">
                          <User className="h-3 w-3" />
                        </div>
                      </div>
                      <div className="bg-primary/90 text-primary-foreground p-3.5 rounded-2xl rounded-tr-sm shadow-sm max-w-[90%] text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                   </div>
                ))}

                {activeModel?.assistant_message && (
                  <div className="flex flex-col gap-1 items-start mt-6">
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <div className="bg-emerald-500/10 text-emerald-600 h-5 w-5 rounded-md flex items-center justify-center">
                          <Bot className="h-3 w-3" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                           {activeModel.model || 'Assistant'}
                        </span>
                        {activeModel.provider && (
                           <Badge variant="outline" className="text-[9px] h-4 py-0 px-1.5 font-mono">{activeModel.provider}</Badge>
                        )}
                      </div>
                      <div className="bg-card border border-border shadow-sm p-4 rounded-2xl rounded-tl-sm w-full text-sm leading-relaxed whitespace-pre-wrap text-card-foreground">
                        {activeModel.assistant_message.content}
                      </div>
                  </div>
                )}
             </div>
          </div>

          {/* RIGHT PANEL: Analytical Tabs */}
          <div className="flex-1 flex flex-col bg-background/50 overflow-hidden">
             <div className="shrink-0 flex items-center overflow-x-auto border-b border-border bg-card px-2 pt-2 scrollbar-none gap-1">
                {TABS.map((t) => {
                   const Icon = t.icon;
                   const isActive = tab === t.id;
                   return (
                     <Tooltip key={t.id} content={t.tip} side="bottom">
                      <button
                        onClick={() => handleTabChange(t.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0 rounded-t-lg",
                          isActive
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                         <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground/70")} />
                         {t.label}
                      </button>
                     </Tooltip>
                   );
                })}
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
                <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-2 fade-in duration-300">
                  {tab === 'overview' && <OverviewTab qcCase={qcCase} qcVersions={qcVersionsData?.versions} />}
                  {tab === 'rubric' && (rubricLoading ? <LoadingTab /> : <RubricTab criteria={rubricData || activeModel?.qc_rubric} />)}
                  {tab === 'judges' && (judgesLoading ? <LoadingTab /> : <JudgesTab judges={judgesData || activeModel?.qc_judges} />)}
                  {tab === 'fraud' && <FraudTab signals={activeModel?.qc_fraud_signals} qcCase={qcCase} />}
                  {tab === 'holistic' && <HolisticTab holistic={(activeModel as any)?.qc_holistic_evaluation} qcCase={qcCase} />}
                  {tab === 'attribution' && <AttributionTab attribution={attributionData} qcCase={qcCase} />}
                  {tab === 'entropy' && <EntropyTab entropy={entropyData} shared={shared} qcCase={qcCase} />}
                  {tab === 'timeline' && <TimelineTab timeline={activeModel?.qc_status_history} pipeline={pipelineStatus} />}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

function LoadingTab() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <RefreshCcw className="h-6 w-6 animate-spin mb-4 text-primary/50" />
      <span className="text-sm font-medium">Loading tab data...</span>
    </div>
  );
}

function SectionHeader({ title, description, icon: Icon }: { title: string; description: string; icon?: any }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      {Icon && (
        <div className="bg-primary/10 text-primary h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function MetricCard({ title, value, suffix, isPercent = false, tip }: { title: string; value?: number | null; suffix: string; isPercent?: boolean; tip?: string }) {
  const displayVal = value == null ? '\u2014' : isPercent ? (value * 100).toFixed(1) : value.toFixed(3);
  const inner = (
    <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex flex-col justify-center items-center hover:bg-muted/20 transition-colors">
       <span className="text-xs font-semibold text-muted-foreground tracking-tight uppercase mb-2 flex items-center gap-1">
         {title}
         {tip && <Info className="h-3 w-3 text-muted-foreground/50" />}
       </span>
       <div className="flex items-end gap-1">
         <span className="text-3xl font-black font-mono tracking-tighter text-foreground">{displayVal}</span>
         <span className="text-lg font-bold text-muted-foreground/60 mb-1">{suffix}</span>
       </div>
    </div>
  );
  if (tip) return <Tooltip content={tip} side="bottom">{inner}</Tooltip>;
  return inner;
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ qcCase, qcVersions }: { qcCase: any; qcVersions?: QcVersionEntry[] }) {
  if (!qcCase) return <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">QC Case still processing or unavailable.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <MetricCard title="Process Score" value={qcCase.process_score} suffix="" tip="Aggregate process verification score from judges. Higher = more confident the response followed correct reasoning steps." />
         <MetricCard title="FP Score" value={qcCase.fp_score} suffix="" tip="False Positive score. Higher values suggest the failure marking may be incorrect (the response was actually fine)." />
         <MetricCard title="Holistic Match" value={qcCase.holistic_score} suffix="%" isPercent tip="Semantic similarity between the response and an ideal answer. 100% = perfect match." />
         <MetricCard title="Global Entropy" value={qcCase.d_global} suffix="" tip="Normalized semantic entropy across model re-generations. Low = consistent answers (reliable). High = contradictory answers (unreliable)." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className="shadow-sm border-border">
            <CardHeader className="py-4">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <Shield className="h-4 w-4 text-purple-500" /> Fraud & Trust
               </CardTitle>
               <CardDescription className="text-xs">Aggregate heuristic fraud detection across 7 signals</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                  <span className="text-sm font-medium">Fraud Score</span>
                  <div className="flex items-center gap-2">
                    <FraudScoreBadge score={qcCase.fraud_score} />
                  </div>
               </div>
               {qcCase.fraud_status && (
                 <div className="mt-3 flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={qcCase.fraud_status === 'Flagged' ? 'destructive' : 'secondary'}>{qcCase.fraud_status}</Badge>
                 </div>
               )}
               {qcCase.fraud_flags && Object.keys(qcCase.fraud_flags).length > 0 && (
                 <div className="mt-3 flex flex-wrap gap-1.5">
                   {Object.entries(qcCase.fraud_flags).map(([key, val]) => (
                     <Badge key={key} variant="outline" className="text-[10px] font-mono">
                       {key}: {String(val)}
                     </Badge>
                   ))}
                 </div>
               )}
            </CardContent>
         </Card>

         <Card className="shadow-sm border-border">
            <CardHeader className="py-4">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <DollarSign className="h-4 w-4 text-emerald-500" /> Payout Status
               </CardTitle>
               <CardDescription className="text-xs">Whether this failure qualifies for user compensation</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border/50 min-h-[100px]">
                  {qcCase.payout_eligible === true ? (
                    <div className="text-emerald-500 flex flex-col items-center gap-2">
                       <CheckCircle2 className="h-6 w-6" />
                       <span className="font-bold">ELIGIBLE FOR PAYOUT</span>
                    </div>
                  ) : qcCase.payout_eligible === false ? (
                    <div className="text-destructive flex flex-col items-center gap-2">
                       <XCircle className="h-6 w-6" />
                       <span className="font-bold">PAYOUT BLOCKED</span>
                       {qcCase.payout_block_reason && (
                         <span className="text-xs text-muted-foreground text-center mt-1">{qcCase.payout_block_reason}</span>
                       )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground font-medium">PENDING</div>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>

      {qcCase.root_cause && (
        <Card className="shadow-sm border-border">
          <CardHeader className="py-4 bg-muted/20 border-b border-border">
             <CardTitle className="text-sm font-bold flex items-center gap-2">Root Cause Analysis</CardTitle>
             <CardDescription className="text-xs">Probabilistic attribution of why this failure occurred</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
             <div className="flex items-center gap-3 mb-3">
               <span className="text-sm text-muted-foreground font-medium">Primary Root Cause:</span>
               <Badge className="bg-slate-700 text-white font-mono">{ATTRIBUTION_FIELDS[qcCase.root_cause]?.label || qcCase.root_cause}</Badge>
             </div>
             {qcCase.verdict_reason && (
               <div className="text-sm bg-card border border-border p-4 rounded-xl leading-relaxed text-foreground/90 shadow-sm">
                 {qcCase.verdict_reason}
               </div>
             )}
          </CardContent>
        </Card>
      )}

      {qcCase.correctness_checks && qcCase.correctness_checks.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardHeader className="py-4 bg-muted/20 border-b border-border">
             <CardTitle className="text-sm font-bold flex items-center gap-2">
                 Correctness Checks <Badge variant="outline" className="text-[10px] ml-2 font-mono">{qcCase.pipeline_type}</Badge>
             </CardTitle>
             <CardDescription className="text-xs">Self-consistency verification of the model's response</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-border">
                {qcCase.correctness_checks.map((chk: any, i: number) => (
                   <div key={i} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                      <div className="shrink-0 mt-0.5">
                         {chk.correct ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                         ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                         )}
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-sm font-bold", chk.correct ? "text-emerald-700" : "text-destructive")}>
                               {chk.correct ? "Correct" : "Incorrect"}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                               Conf: {(chk.confidence || 0).toFixed(2)}
                            </span>
                         </div>
                         {chk.issues ? (
                           <p className="text-sm text-muted-foreground mt-2 leading-relaxed bg-card border border-border/50 p-3 rounded-lg shadow-sm">
                             {chk.issues}
                           </p>
                         ) : (
                           <p className="text-xs text-muted-foreground italic mt-1">No issues flagged.</p>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          </CardContent>
        </Card>
      )}

      {/* QC Version History */}
      {qcVersions && qcVersions.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardHeader className="py-4 bg-muted/20 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-blue-500" />
              QC Version History
              <Badge variant="secondary" className="text-[10px] ml-1 font-mono">{qcVersions.length} run{qcVersions.length !== 1 ? 's' : ''}</Badge>
            </CardTitle>
            <CardDescription className="text-xs">All QC pipeline runs for this conversation, newest first</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ver</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Case ID</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verdict</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">FP</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Process</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Latency</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {qcVersions.map((v) => {
                    const isLatest = v.version === qcVersions.length;
                    const statusColor =
                      v.status === 'completed' ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' :
                      v.status === 'failed' || v.status === 'error' ? 'text-red-600 bg-red-500/10 border-red-500/20' :
                      'text-blue-600 bg-blue-500/10 border-blue-500/20';
                    return (
                      <tr key={v.id} className={cn("hover:bg-muted/20 transition-colors", isLatest && "bg-primary/[0.03]")}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-foreground">v{v.version}</span>
                            {isLatest && <Badge variant="outline" className="text-[8px] px-1 py-0 font-bold text-primary border-primary/30">LATEST</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{v.id}</td>
                        <td className="px-4 py-3">
                          {v.verdict ? (
                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-2 py-0.5", getVerdictTheme(v.verdict))}>
                              {getVerdictLabel(v.verdict)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{v.fp_score != null ? v.fp_score.toFixed(3) : '--'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{v.process_score != null ? v.process_score.toFixed(3) : '--'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                          {v.pipeline_latency_ms != null ? `${(v.pipeline_latency_ms / 1000).toFixed(1)}s` : '--'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("text-[9px] uppercase font-bold px-1.5 py-0", statusColor)}>
                            {v.status || v.pipeline_stage || 'unknown'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {v.created_at ? format(new Date(v.created_at), 'MMM d, yyyy HH:mm') : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Fraud Score Badge (reusable) ────────────────────────────────────────────

function FraudScoreBadge({ score }: { score?: number | null }) {
  const s = score ?? 0;
  const color = s > 0.5 ? 'text-red-600' : s > 0.2 ? 'text-yellow-600' : 'text-emerald-600';
  const label = s > 0.5 ? 'High Risk' : s > 0.2 ? 'Warning' : 'Low Risk';
  return (
    <div className="flex items-center gap-2">
      <span className={cn("font-mono font-bold text-lg", color)}>
        {score != null ? score.toFixed(3) : 'N/A'}
      </span>
      <Badge variant="outline" className={cn("text-[9px] uppercase font-bold", color)}>
        {label}
      </Badge>
    </div>
  );
}

// ─── Rubric Tab ──────────────────────────────────────────────────────────────

function RubricTab({ criteria }: { criteria?: any[] }) {
  if (!criteria || criteria.length === 0) return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">No rubric criteria tracked.</div>;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="FActScore Rubric"
        description="Atomic claims extracted from the model's response. Each claim is verified against evidence and scored independently."
        icon={Shield}
      />
      <Card className="shadow-sm border-border overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-sm">
               <thead className="bg-muted/50 border-b border-border">
                  <tr>
                     <th className="px-4 py-3 font-semibold text-left text-xs uppercase tracking-wider text-muted-foreground w-1/3">Criterion</th>
                     <th className="px-4 py-3 font-semibold text-left text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                     <th className="px-4 py-3 font-semibold text-left text-xs uppercase tracking-wider text-muted-foreground">Type/Weight</th>
                     <th className="px-4 py-3 font-semibold text-left text-xs uppercase tracking-wider text-muted-foreground">Evidence Map</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/60 bg-card">
                  {criteria.map((c, i) => (
                     <tr key={i} className="hover:bg-muted/20">
                        <td className="px-4 py-4 align-top">
                           <div className="font-medium text-foreground">{c.name || c.claim_text}</div>
                           {c.step_id && <div className="text-[11px] font-mono text-muted-foreground mt-1 bg-muted px-1.5 py-0.5 rounded w-fit">{c.step_id}</div>}
                        </td>
                        <td className="px-4 py-4 align-top">
                           <Badge variant={c.status === 'CORRECT' || c.verdict === 'supported' ? 'default' : c.status === 'INCORRECT' || c.verdict === 'contradicted' ? 'destructive' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wider">
                             {c.status || c.verdict || 'N/A'}
                           </Badge>
                           {c.d_i != null && <div className="text-[11px] font-mono text-muted-foreground mt-2">Val: {c.d_i.toFixed(2)}</div>}
                           {c.confidence != null && <div className="text-[11px] font-mono text-muted-foreground mt-1">Conf: {(c.confidence * 100).toFixed(0)}%</div>}
                        </td>
                        <td className="px-4 py-4 align-top">
                           <div className="text-xs">{c.type || c.category || '\u2014'}</div>
                           <div className="text-xs text-muted-foreground mt-1">Wt: {c.weight?.toFixed(2) || '\u2014'}</div>
                           {c.severity && <div className="text-xs text-muted-foreground mt-1">Severity: {c.severity}</div>}
                        </td>
                        <td className="px-4 py-4 align-top">
                           <div className="flex flex-col gap-2 max-w-sm">
                              {(c.evidence_expected || c.evidence_actual || c.evidence_text) ? (
                                <>
                                  {(c.evidence_expected || c.evidence_text) && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2 text-[11px] text-emerald-800 leading-tight">
                                       <strong className="block mb-0.5">Expected:</strong> {c.evidence_expected || c.evidence_text}
                                    </div>
                                  )}
                                  {(c.evidence_actual || c.explanation) && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-[11px] text-red-800 leading-tight">
                                       <strong className="block mb-0.5">Actual:</strong> {c.evidence_actual || c.explanation}
                                    </div>
                                  )}
                                </>
                              ) : (
                                 <span className="text-xs text-muted-foreground italic">N/A</span>
                              )}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}

// ─── Judges Tab ──────────────────────────────────────────────────────────────

function JudgesTab({ judges }: { judges?: any[] }) {
  if (!judges || judges.length === 0) return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">No judge analysis present.</div>;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="LLM Judge Panel"
        description="Independent evaluations from 3 judges (process verifier, tool strategy, devil's advocate). Majority verdict determines outcome."
        icon={Layers}
      />
      <div className="flex flex-col gap-4">
         {judges.map((j, i) => (
            <Card key={i} className="shadow-sm border-border overflow-hidden group">
               <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-linear-to-r from-muted/30 to-card">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{i+1}</div>
                     <div>
                       <h4 className="text-sm font-bold">{j.model_id || 'Unknown Model'}</h4>
                       <p className="text-[11px] text-muted-foreground tracking-wider uppercase font-medium">{j.judge_role}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold">Process Score</span>
                        <span className="font-mono font-black text-lg text-primary">{j.process_score?.toFixed(3) ?? '\u2014'}</span>
                     </div>
                  </div>
               </div>
               <CardContent className="p-5">
                  {j.reasoning ? (
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                       {typeof j.reasoning === 'object' ? JSON.stringify(j.reasoning, null, 2) : j.reasoning}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">No reasoning provided by the judge.</p>
                  )}

                  {j.signal_scores && Object.keys(j.signal_scores).length > 0 && (
                    <div className="mt-4 border-t border-border pt-4">
                       <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sub-criterion Breakdown</p>
                       <div className="flex flex-wrap gap-2">
                          {Object.entries(j.signal_scores).map(([k, v]) => (
                             <Badge key={k} variant="secondary" className="px-2.5 py-1 text-xs font-mono font-medium flex gap-2 w-fit">
                                <span className="text-muted-foreground">{k}:</span>
                                <span>{typeof v === 'number' ? v.toFixed(2) : String(v)}</span>
                             </Badge>
                          ))}
                       </div>
                    </div>
                  )}
               </CardContent>
            </Card>
         ))}
      </div>
    </div>
  );
}

// ─── Fraud Tab (FULLY REWORKED) ──────────────────────────────────────────────

function FraudTab({ signals, qcCase }: { signals?: any[]; qcCase?: any }) {
  const allSignals = signals ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Fraud Detection"
        description="7 heuristic signals that detect abuse without using LLMs. Each signal is scored 0-1. Scores above 0.5 are high risk, above 0.2 are warnings."
        icon={Fingerprint}
      />

      {/* Aggregate Summary */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="p-5 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Aggregate Fraud Score</span>
              <FraudScoreBadge score={qcCase?.fraud_score} />
            </div>
            <div className="p-5 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fraud Status</span>
              <span className="text-lg font-bold">
                {qcCase?.fraud_status === 'Flagged' ? (
                  <span className="text-red-600 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Flagged</span>
                ) : qcCase?.fraud_status ? (
                  <span className="text-emerald-600">{qcCase.fraud_status}</span>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </span>
            </div>
            <div className="p-5 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Signals Triggered</span>
              <span className="text-lg font-bold font-mono">
                <span className={cn(allSignals.filter(s => (s.score ?? 0) > 0.2).length > 0 ? 'text-yellow-600' : 'text-emerald-600')}>
                  {allSignals.filter(s => (s.score ?? 0) > 0.2).length}
                </span>
                <span className="text-muted-foreground"> / {allSignals.length || 7}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fraud Consequence Info */}
      {qcCase?.verdict === 'FraudBlock' && (
        <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <Ban className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-purple-700">FraudBlock Active</p>
            <p className="text-xs text-purple-600 mt-1">This conversation has been rejected (terminal). The user's wallet is frozen for 48 hours. This decision cannot be reversed through the pipeline.</p>
          </div>
        </div>
      )}

      {/* Individual Signal Cards */}
      {allSignals.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-foreground">Signal Breakdown</h4>
          {allSignals.map((signal, i) => {
            const meta = FRAUD_SIGNAL_META[signal.signal_type] || {
              label: signal.signal_type || 'Unknown Signal',
              description: 'No description available for this signal type.',
              riskNote: '',
            };
            const score = signal.score ?? 0;
            const pct = Math.round(score * 100);
            const isHigh = score > 0.5;
            const isWarning = score > 0.2 && !isHigh;

            return (
              <Card key={i} className={cn(
                "shadow-sm transition-all overflow-hidden",
                isHigh ? "border-red-500/50" : isWarning ? "border-yellow-500/40" : "border-border"
              )}>
                <div className={cn(
                  "px-5 py-4",
                  isHigh ? "bg-red-500/5" : isWarning ? "bg-yellow-500/5" : ""
                )}>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-bold">{meta.label}</h5>
                        {isHigh && <Badge variant="destructive" className="text-[9px] uppercase">High Risk</Badge>}
                        {isWarning && <Badge variant="outline" className="text-[9px] uppercase text-yellow-700 border-yellow-500/50 bg-yellow-500/10">Warning</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{meta.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn(
                        "font-mono font-black text-2xl",
                        isHigh ? "text-red-600" : isWarning ? "text-yellow-600" : "text-emerald-600"
                      )}>
                        {score.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isHigh ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Description from API + risk note */}
                  {(signal.description || meta.riskNote) && (
                    <div className="mt-3 space-y-1.5">
                      {signal.description && (
                        <p className="text-xs text-foreground/80">{signal.description}</p>
                      )}
                      {isHigh && meta.riskNote && (
                        <p className="text-[11px] text-red-600/80 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 shrink-0" /> {meta.riskNote}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Evidence */}
                  {signal.evidence && Object.keys(signal.evidence).length > 0 && (
                    <div className={cn(
                      "mt-3 rounded-lg border p-3 text-xs",
                      isHigh ? "bg-red-500/5 border-red-500/20" : isWarning ? "bg-yellow-500/5 border-yellow-500/20" : "bg-muted/30 border-border/50"
                    )}>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block mb-1.5">Evidence</span>
                      <div className="space-y-1">
                        {Object.entries(signal.evidence).map(([key, val]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-mono text-muted-foreground shrink-0">{key}:</span>
                            <span className="text-foreground/90 break-all">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-sm border-border">
          <CardContent className="py-12 text-center">
            <Shield className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No Fraud Signals Detected</p>
            <p className="text-xs text-muted-foreground mt-1">All 7 heuristic fraud checks passed with low risk scores.</p>
          </CardContent>
        </Card>
      )}

      {/* Fraud Flags from QC Case */}
      {qcCase?.fraud_flags && Object.keys(qcCase.fraud_flags).length > 0 && (
        <Card className="shadow-sm border-border">
          <CardHeader className="py-3 bg-muted/20 border-b border-border">
            <CardTitle className="text-sm font-bold">Fraud Flags</CardTitle>
            <CardDescription className="text-xs">Additional flags stored on the QC case</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(qcCase.fraud_flags).map(([key, val]) => (
                <Badge key={key} variant="outline" className="text-xs font-mono px-2.5 py-1">
                  {key}: {String(val)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Holistic Tab (REWORKED from JSON dump) ──────────────────────────────────

function HolisticTab({ holistic, qcCase }: { holistic?: any; qcCase?: any }) {
  if (!holistic && !qcCase?.holistic_score) {
    return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">Holistic evaluation not available.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Holistic Evaluation"
        description="Deep semantic matching and completeness checking. Evaluates the response as a whole rather than per-claim."
        icon={Eye}
      />

      {/* Score Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Holistic Score" value={holistic?.holistic_score ?? qcCase?.holistic_score} suffix="%" isPercent tip="Overall quality score from the holistic evaluator" />
        <MetricCard title="Completeness" value={holistic?.completeness_score} suffix="%" isPercent tip="How much of the required information was covered" />
        <MetricCard title="Accuracy" value={holistic?.accuracy_score} suffix="%" isPercent tip="Factual correctness of the claims in the response" />
        <MetricCard title="Usefulness" value={holistic?.usefulness_score} suffix="%" isPercent tip="How practically useful the response is to the user" />
      </div>

      {/* Reasoning */}
      {holistic?.reasoning && (
        <Card className="shadow-sm border-border">
          <CardHeader className="py-3 bg-muted/20 border-b border-border">
            <CardTitle className="text-sm font-bold">Evaluation Reasoning</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{holistic.reasoning}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Strengths / Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {holistic?.key_strengths && holistic.key_strengths.length > 0 && (
          <Card className="shadow-sm border-border">
            <CardHeader className="py-3 bg-emerald-500/5 border-b border-emerald-500/20">
              <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {holistic.key_strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-emerald-500 mt-1 shrink-0">&bull;</span> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {holistic?.key_weaknesses && holistic.key_weaknesses.length > 0 && (
          <Card className="shadow-sm border-border">
            <CardHeader className="py-3 bg-red-500/5 border-b border-red-500/20">
              <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Key Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {holistic.key_weaknesses.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-red-500 mt-1 shrink-0">&bull;</span> {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Override info */}
      {qcCase?.holistic_override_applied && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-xs text-yellow-700 font-medium">Holistic override was applied to this evaluation.</span>
        </div>
      )}

      {/* Raw data fallback if holistic is just a raw object without structured fields */}
      {holistic && !holistic.holistic_score && !holistic.reasoning && !holistic.completeness_score && (
        <Card className="shadow-sm border-border">
          <CardHeader className="bg-muted/20 border-b border-border">
            <CardTitle className="text-sm font-bold">Raw Evaluation Data</CardTitle>
          </CardHeader>
          <CardContent className="p-6 overflow-x-auto">
            <pre className="text-[11px] font-mono leading-relaxed bg-muted/40 p-4 rounded-xl border border-border/50">
              {JSON.stringify(holistic, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Attribution Tab (REWORKED from JSON dump) ───────────────────────────────

function AttributionTab({ attribution, qcCase }: { attribution?: any; qcCase?: any }) {
  if (!attribution && !qcCase?.root_cause) {
    return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">Failure attribution processing not complete.</div>;
  }

  // Extract probability fields from attribution response
  const probabilities: Record<string, number> = {};
  if (attribution) {
    for (const [key, val] of Object.entries(attribution)) {
      if (key in ATTRIBUTION_FIELDS && typeof val === 'number') {
        probabilities[key] = val;
      }
    }
    // Also check nested probabilities object
    if (attribution.probabilities && typeof attribution.probabilities === 'object') {
      for (const [key, val] of Object.entries(attribution.probabilities)) {
        if (typeof val === 'number') {
          probabilities[key] = val;
        }
      }
    }
    // Also check attribution_probabilities
    if (attribution.attribution_probabilities && typeof attribution.attribution_probabilities === 'object') {
      for (const [key, val] of Object.entries(attribution.attribution_probabilities)) {
        if (typeof val === 'number') {
          probabilities[key] = val;
        }
      }
    }
  }

  const sortedProbs = Object.entries(probabilities).sort(([, a], [, b]) => b - a);
  const primaryCause = sortedProbs.length > 0 ? sortedProbs[0]![0] : qcCase?.root_cause;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Root Cause Attribution"
        description="Probabilistic breakdown of what caused this failure. Each category shows the likelihood that it was the primary driver."
        icon={MessageSquareWarning}
      />

      {/* Primary Cause Badge */}
      {primaryCause && (
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl shadow-sm">
          <div className="bg-primary/10 text-primary h-10 w-10 rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Primary Attribution</span>
            <p className="text-sm font-bold">{ATTRIBUTION_FIELDS[primaryCause]?.label || primaryCause}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{ATTRIBUTION_FIELDS[primaryCause]?.description || ''}</p>
          </div>
          {sortedProbs.length > 0 && (
            <div className="ml-auto text-right">
              <span className="font-mono font-black text-2xl text-primary">{(sortedProbs[0]![1] * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Probability Bars */}
      {sortedProbs.length > 0 ? (
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="py-3 bg-muted/20 border-b border-border">
            <CardTitle className="text-sm font-bold">Attribution Probabilities</CardTitle>
            <CardDescription className="text-xs">Likelihood that each factor was the primary cause of failure</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {sortedProbs.map(([key, prob]) => {
              const meta = ATTRIBUTION_FIELDS[key] || { label: key, description: '' };
              const pct = Math.round(prob * 100);
              const isPrimary = key === primaryCause;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", isPrimary ? "text-primary font-bold" : "text-foreground")}>
                        {meta.label}
                      </span>
                      {isPrimary && <Badge className="text-[9px] px-1.5 py-0">Primary</Badge>}
                    </div>
                    <span className={cn("font-mono font-bold text-sm", isPrimary ? "text-primary" : "text-foreground")}>
                      {pct}%
                    </span>
                  </div>
                  <div className="bg-muted h-2.5 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", isPrimary ? "bg-primary" : "bg-muted-foreground/30")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{meta.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : attribution ? (
        // Fallback: show raw attribution data if we couldn't parse probability fields
        <Card className="shadow-sm border-border">
          <CardHeader className="bg-muted/20 border-b border-border">
            <CardTitle className="text-sm font-bold">Attribution Data</CardTitle>
          </CardHeader>
          <CardContent className="p-6 overflow-x-auto">
            <pre className="text-[11px] font-mono leading-relaxed bg-muted/40 p-4 rounded-xl border border-border/50">
              {JSON.stringify(attribution, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {/* Additional attribution details */}
      {attribution?.causal_chain && (
        <Card className="shadow-sm border-border">
          <CardHeader className="py-3 bg-muted/20 border-b border-border">
            <CardTitle className="text-sm font-bold">Causal Chain</CardTitle>
            <CardDescription className="text-xs">Step-by-step reasoning chain showing how the failure propagated</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {Array.isArray(attribution.causal_chain) ? (
              <div className="space-y-3">
                {attribution.causal_chain.map((step: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="bg-muted text-muted-foreground h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-sm text-foreground/90">{typeof step === 'string' ? step : JSON.stringify(step)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/90">{JSON.stringify(attribution.causal_chain)}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payout eligibility from attribution */}
      {attribution?.payout_eligible != null && (
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-xl border",
          attribution.payout_eligible ? "bg-emerald-500/5 border-emerald-500/30" : "bg-red-500/5 border-red-500/30"
        )}>
          {attribution.payout_eligible ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <div>
            <p className={cn("text-sm font-bold", attribution.payout_eligible ? "text-emerald-700" : "text-red-700")}>
              {attribution.payout_eligible ? 'Payout Eligible' : 'Payout Blocked'}
            </p>
            {attribution.payout_block_reason && (
              <p className="text-xs text-muted-foreground mt-0.5">{attribution.payout_block_reason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Entropy Tab ─────────────────────────────────────────────────────────────

function EntropyTab({ entropy, shared, qcCase }: { entropy?: any; shared: any; qcCase: any }) {
  const entropySource = entropy || shared?.semantic_entropy_results?.[0];
  if (!entropySource && qcCase?.d_global == null) {
    return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">Entropy analysis not executed.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Semantic Entropy Analysis"
        description="Measures how consistent the model is when re-generating answers. Low entropy = the model consistently gives similar answers (more reliable). High entropy = the model contradicts itself (less reliable)."
        icon={GitBranch}
      />

      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title="Normalized Entropy (d_global)"
          value={entropySource?.normalized_entropy ?? qcCase?.d_global}
          suffix=""
          tip="0 = perfectly consistent, 1 = maximum disagreement across re-generations"
        />
        <MetricCard
          title="Samples Generated"
          value={entropySource?.num_samples ?? qcCase?.cross_model_samples}
          suffix=""
          tip="Number of independent re-generations used to compute entropy"
        />
      </div>

      {entropySource && (
        <Card className="shadow-sm border-border">
          <CardHeader className="py-3 bg-muted/20 border-b border-border">
            <CardTitle className="text-sm font-bold">Raw Entropy Data</CardTitle>
            <CardDescription className="text-xs">Cluster assignments, Shannon entropy values, and interpretation signals</CardDescription>
          </CardHeader>
          <CardContent className="p-6 overflow-x-auto">
            <pre className="text-[11px] font-mono leading-relaxed bg-muted/40 p-4 rounded-xl border border-border/50">
              {JSON.stringify(entropySource, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Timeline Tab ────────────────────────────────────────────────────────────

function TimelineTab({ timeline, pipeline }: { timeline?: any[]; pipeline?: any }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pipeline Timeline"
        description="Execution history showing every stage transition in the 14-stage QC pipeline."
        icon={Clock}
      />

      {pipeline && (
        <Card className="shadow-sm border-border bg-linear-to-br from-blue-500/5 to-transparent">
           <CardHeader className="py-4 border-b border-blue-500/10">
              <CardTitle className="text-sm font-bold text-blue-800 flex items-center gap-2">
                 <RefreshCcw className="h-4 w-4" /> Pipeline Heartbeat
              </CardTitle>
           </CardHeader>
           <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">Current Stage</p>
                <div className="text-lg font-black font-mono text-blue-900">
                  {PIPELINE_STATUS_META[pipeline.pipeline_stage]?.label || pipeline.pipeline_stage?.replace(/_/g, ' ') || 'Unknown'}
                </div>
                {PIPELINE_STATUS_META[pipeline.pipeline_stage]?.description && (
                  <p className="text-xs text-muted-foreground mt-1">{PIPELINE_STATUS_META[pipeline.pipeline_stage]?.description}</p>
                )}
              </div>
              <Badge variant={pipeline.pipeline_stage === 'complete' ? 'default' : 'outline'} className="text-xs px-3 py-1">
                 {pipeline.pipeline_stage === 'complete' ? 'Done' : 'In Progress'}
              </Badge>
           </CardContent>
        </Card>
      )}

      {timeline && timeline.length > 0 ? (
        <Card className="shadow-sm border-border">
          <CardHeader className="bg-muted/20 border-b border-border">
             <CardTitle className="text-base font-bold">Execution History</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
               {timeline.map((event, i) => {
                  const stageKey = event.pipeline_stage || event.status_code;
                  const stageMeta = stageKey ? PIPELINE_STATUS_META[stageKey] : null;
                  return (
                    <div key={i} className="flex gap-4">
                       <div className="flex flex-col items-center">
                          <div className="bg-primary/20 border-2 border-primary h-3 w-3 rounded-full mt-1.5" />
                          {i < timeline.length - 1 && <div className="bg-border w-px flex-1 my-1" />}
                       </div>
                       <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold capitalize">
                               {stageMeta?.label || (stageKey ? stageKey.replace(/_/g, ' ') : (event.description || 'Unknown'))}
                            </p>
                            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              {format(new Date(event.effective_from || event.timestamp || event.created_at || new Date()), 'HH:mm:ss.SSS')}
                            </span>
                          </div>
                          {stageMeta?.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{stageMeta.description}</p>
                          )}
                          {event.reason && <p className="text-xs text-muted-foreground mt-1">{event.reason}</p>}
                          {event.actor && <p className="text-xs text-muted-foreground mt-1">Actor: {event.actor}</p>}
                       </div>
                    </div>
                  );
               })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">No historical timeline data available for this QC run.</div>
      )}
    </div>
  );
}
