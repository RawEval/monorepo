'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, RefreshCcw, Layers, AlertCircle, XCircle, User, Bot,
  Clock, GitBranch, CheckCircle2, Activity, DollarSign,
  Shield, PieChart, ActivityIcon, Fingerprint, MessageSquareWarning
} from 'lucide-react';
import {
  adminConversationsService
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
import { cn } from '@raweval/utils';
import { format } from 'date-fns';

type TabId = 'overview' | 'rubric' | 'judges' | 'fraud' | 'holistic' | 'attribution' | 'entropy' | 'timeline';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: PieChart },
  { id: 'rubric', label: 'Rubric', icon: Shield },
  { id: 'judges', label: 'Judges', icon: Layers },
  { id: 'fraud', label: 'Fraud', icon: Fingerprint },
  { id: 'holistic', label: 'Holistic', icon: ActivityIcon },
  { id: 'attribution', label: 'Attribution', icon: MessageSquareWarning },
  { id: 'entropy', label: 'Entropy', icon: GitBranch },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

export default function ConversationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? parseInt(params.id, 10) : NaN;
  const tabFromUrl = (searchParams?.get('tab') as TabId) || 'overview';
  const [tab, setTab] = useState<TabId>(tabFromUrl);

  const isIdValid = Number.isInteger(id) && id > 0;

  // Real-time polling
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
  const activeModel = models[0]; // Focusing on primary model for the analysis tabs
  const qcCase = activeModel?.qc_case;
  
  const getVerdictTheme = (verdict?: string | null) => {
    switch(verdict) {
      case 'FailedPrompt': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'FalsePositive': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'NeedsHumanReview': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      case 'FraudBlock': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

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
                    {qcCase.verdict}
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
                <span className="text-xs text-muted-foreground ml-2">
                  {format(new Date(), 'MMM d, yyyy h:mm a')}
                </span>
                {pipelineStatus?.pipeline_stage && pipelineStatus.pipeline_stage !== 'complete' && (
                  <Badge variant="outline" className="text-[10px] ml-2 animate-pulse bg-blue-500/10 text-blue-600 border-blue-500/30">
                    <RefreshCcw className="h-3 w-3 mr-1 animate-spin" /> Evaluating...
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
                      <button 
                        key={t.id} 
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
                   );
                })}
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
                <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-2 fade-in duration-300">
                  {tab === 'overview' && <OverviewTab qcCase={qcCase} />}
                  {tab === 'rubric' && (rubricLoading ? <LoadingTab /> : <RubricTab criteria={rubricData || activeModel?.qc_rubric} />)}
                  {tab === 'judges' && (judgesLoading ? <LoadingTab /> : <JudgesTab judges={judgesData || activeModel?.qc_judges} />)}
                  {tab === 'fraud' && <FraudTab signals={activeModel?.qc_fraud_signals} />}
                  {tab === 'holistic' && <HolisticTab holistic={activeModel?.qc_case?.holistic_score} />}
                  {tab === 'attribution' && <AttributionTab attribution={attributionData} />}
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

// -----------------------------------------------------------------------------------------------------------------------------
// TAB COMPONENTS
// -----------------------------------------------------------------------------------------------------------------------------

function LoadingTab() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <RefreshCcw className="h-6 w-6 animate-spin mb-4 text-primary/50" />
      <span className="text-sm font-medium">Loading tab metric...</span>
    </div>
  );
}

function OverviewTab({ qcCase }: { qcCase: any }) {
  if (!qcCase) return <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">QC Case still processing or unavailable.</div>;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <MetricCard title="Process Score" value={qcCase.process_score} suffix="" />
         <MetricCard title="FP Score" value={qcCase.fp_score} suffix="" />
         <MetricCard title="Holistic Match" value={qcCase.holistic_score} suffix="%" isPercent />
         <MetricCard title="Global Entropy" value={qcCase.d_global} suffix="" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className="shadow-sm border-border">
            <CardHeader className="py-4">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <Shield className="h-4 w-4 text-purple-500" /> Fraud & Trust
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                  <span className="text-sm font-medium">Aggregated Fraud Score</span>
                  <span className={cn("font-mono font-bold text-lg", (qcCase.fraud_score || 0) > 0.0 ? 'text-destructive' : 'text-emerald-500')}>
                    {(qcCase.fraud_score || 0).toFixed(3)}
                  </span>
               </div>
               {qcCase.fraud_status && (
                 <div className="mt-3 flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <span className="text-sm font-medium">Fraud Verdict</span>
                    <Badge variant={qcCase.fraud_status === 'Flagged' ? 'destructive' : 'secondary'}>{qcCase.fraud_status}</Badge>
                 </div>
               )}
            </CardContent>
         </Card>

         <Card className="shadow-sm border-border">
            <CardHeader className="py-4">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <DollarSign className="h-4 w-4 text-emerald-500" /> Payout Status
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border/50 h-[100px]">
                  {qcCase.payout_eligible === true ? (
                    <div className="text-emerald-500 flex items-center gap-2 font-bold">
                       <CheckCircle2 className="h-6 w-6" /> ELIGIBLE FOR PAYOUT
                    </div>
                  ) : qcCase.payout_eligible === false ? (
                    <div className="text-destructive flex items-center gap-2 font-bold">
                       <XCircle className="h-6 w-6" /> PAYOUT BLOCKED
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
          </CardHeader>
          <CardContent className="pt-4">
             <div className="flex items-center gap-3 mb-3">
               <span className="text-sm text-muted-foreground font-medium">Primary Root Cause:</span>
               <Badge className="bg-slate-700 text-white font-mono">{qcCase.root_cause}</Badge>
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
    </div>
  );
}

function MetricCard({ title, value, suffix, isPercent = false }: { title: string, value?: number, suffix: string, isPercent?: boolean }) {
  const displayVal = value == null ? '—' : isPercent ? (value * 100).toFixed(1) : value.toFixed(3);
  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex flex-col justify-center items-center hover:bg-muted/20 transition-colors">
       <span className="text-xs font-semibold text-muted-foreground tracking-tight uppercase mb-2">{title}</span>
       <div className="flex items-end gap-1">
         <span className="text-3xl font-black font-mono tracking-tighter text-foreground">{displayVal}</span>
         <span className="text-lg font-bold text-muted-foreground/60 mb-1">{suffix}</span>
       </div>
    </div>
  );
}

function RubricTab({ criteria }: { criteria?: any[] }) {
  if (!criteria || criteria.length === 0) return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">No rubric criteria tracked.</div>;
  
  return (
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
                         <div className="font-medium text-foreground">{c.name}</div>
                         <div className="text-[11px] font-mono text-muted-foreground mt-1 bg-muted px-1.5 py-0.5 rounded w-fit">{c.step_id}</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                         <Badge variant={c.status === 'CORRECT' ? 'default' : c.status === 'INCORRECT' ? 'destructive' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wider">
                           {c.status}
                         </Badge>
                         {c.d_i != null && <div className="text-[11px] font-mono text-muted-foreground mt-2">Val: {c.d_i.toFixed(2)}</div>}
                      </td>
                      <td className="px-4 py-4 align-top">
                         <div className="text-xs">{c.type}</div>
                         <div className="text-xs text-muted-foreground mt-1">Wt: {c.weight?.toFixed(2) || '—'}</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                         <div className="flex flex-col gap-2 max-w-sm">
                            {(c.evidence_expected || c.evidence_actual) ? (
                              <>
                                {c.evidence_expected && (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2 text-[11px] text-emerald-800 leading-tight">
                                     <strong className="block mb-0.5">Expected:</strong> {c.evidence_expected}
                                  </div>
                                )}
                                {c.evidence_actual && (
                                  <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-[11px] text-red-800 leading-tight">
                                     <strong className="block mb-0.5">Actual:</strong> {c.evidence_actual}
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
  );
}

function JudgesTab({ judges }: { judges?: any[] }) {
  if (!judges || judges.length === 0) return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">No judge analysis present.</div>;
  
  return (
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
                      <span className="font-mono font-black text-lg text-primary">{j.process_score?.toFixed(3) ?? '—'}</span>
                   </div>
                </div>
             </div>
             <CardContent className="p-5">
                {j.reasoning ? (
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-sm leading-relaxed text-foreground/90">
                     {j.reasoning}
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
  );
}

function FraudTab({ signals }: { signals?: any[] }) {
  if (!signals || signals.length === 0) return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">No fraud signals mapped.</div>;
  
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map((s, i) => {
             const score = s.score || 0;
             const isHigh = score > 0.5;
             const isWarning = score > 0.2 && !isHigh;
             
             return (
               <Card key={i} className={cn("shadow-sm transition-all", isHigh ? "border-red-500/50 bg-red-500/5" : isWarning ? "border-yellow-500/50 bg-yellow-500/5" : "border-border")}>
                 <CardHeader className="py-4 px-5 border-b border-border/50 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold">{s.signal_type || 'Unknown Signal'}</CardTitle>
                    <span className={cn("font-mono font-black", isHigh ? "text-red-500" : isWarning ? "text-yellow-600" : "text-emerald-500")}>
                       {score.toFixed(3)}
                    </span>
                 </CardHeader>
                 <CardContent className="p-5">
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{s.description || 'No description provided'}</p>
                    {s.evidence && (
                       <div className={cn("text-[11px] p-2.5 rounded leading-relaxed border", 
                          isHigh ? "bg-red-500/10 text-red-800" : 
                          isWarning ? "bg-yellow-500/10 text-yellow-800" : 
                          "bg-muted"
                       )}>
                          <strong className="block mb-1 opacity-80 uppercase tracking-widest text-[9px]">Evidence Match:</strong>
                          {s.evidence}
                       </div>
                    )}
                 </CardContent>
               </Card>
             );
          })}
       </div>
    </div>
  );
}

function HolisticTab({ holistic }: { holistic?: any }) {
  if (!holistic) return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">Holistic evaluation not available.</div>;
  return (
    <Card className="shadow-sm border-border">
       <CardHeader className="bg-muted/20 border-b border-border">
          <CardTitle className="text-base font-bold">Holistic Evaluation Details</CardTitle>
          <CardDescription>Deep semantic matching and completeness checking.</CardDescription>
       </CardHeader>
       <CardContent className="p-6 text-sm overflow-x-auto">
          <pre className="text-[11px] font-mono leading-relaxed bg-muted/40 p-4 rounded-xl border border-border/50">
             {JSON.stringify(holistic, null, 2)}
          </pre>
       </CardContent>
    </Card>
  );
}

function AttributionTab({ attribution }: { attribution?: any }) {
  if (!attribution) return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">Failure attribution processing not complete.</div>;
  return (
    <Card className="shadow-sm border-border">
       <CardHeader className="bg-muted/20 border-b border-border">
          <CardTitle className="text-base font-bold">Cause Attribution</CardTitle>
          <CardDescription>Probabilistic breakdown of primary failure drivers.</CardDescription>
       </CardHeader>
       <CardContent className="p-6 text-sm overflow-x-auto">
          <pre className="text-[11px] font-mono leading-relaxed bg-muted/40 p-4 rounded-xl border border-border/50">
             {JSON.stringify(attribution, null, 2)}
          </pre>
       </CardContent>
    </Card>
  );
}

function EntropyTab({ entropy, shared, qcCase }: { entropy?: any, shared: any, qcCase: any }) {
  const entropySource = entropy || shared?.semantic_entropy_results?.[0];
  if (!entropySource) {
     if (qcCase?.d_global != null) {
       return (
          <div className="space-y-4">
             <Card className="shadow-sm border-border">
                <CardHeader className="bg-muted/20 border-b border-border">
                   <CardTitle className="text-base font-bold">Semantic Entropy Statistics</CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-2 gap-4">
                   <MetricCard title="Normalized Entropy (d_global)" value={qcCase.d_global} suffix="" />
                </CardContent>
             </Card>
          </div>
       );
     }
     return <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">Entropy analysis not executed.</div>;
  }
  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-border">
         <CardHeader className="bg-muted/20 border-b border-border">
            <CardTitle className="text-base font-bold">Semantic Entropy Statistics</CardTitle>
         </CardHeader>
         <CardContent className="p-6 grid grid-cols-2 gap-4">
            <MetricCard title="Normalized Entropy" value={entropySource.normalized_entropy ?? qcCase?.d_global} suffix="" />
            <MetricCard title="Samples Generated" value={entropySource.num_samples ?? qcCase?.cross_model_samples} suffix="" />
         </CardContent>
      </Card>
      <Card className="shadow-sm border-border">
         <CardHeader>
            <CardTitle className="text-sm font-bold">Raw Matrix Data</CardTitle>
         </CardHeader>
         <CardContent className="p-6 text-sm overflow-x-auto pt-0">
            <pre className="text-[11px] font-mono leading-relaxed bg-muted/40 p-4 rounded-xl border border-border/50">
               {JSON.stringify(entropySource, null, 2)}
            </pre>
         </CardContent>
      </Card>
    </div>
  );
}

function TimelineTab({ timeline, pipeline }: { timeline?: any[], pipeline?: any }) {
  return (
    <div className="space-y-6">
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
                <div className="text-lg font-black font-mono text-blue-900">{pipeline.pipeline_stage || 'Unknown'}</div>
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
               {timeline.map((event, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="flex flex-col items-center">
                        <div className="bg-primary/20 border-2 border-primary h-3 w-3 rounded-full mt-1.5" />
                        {i < timeline.length - 1 && <div className="bg-border w-px flex-1 my-1" />}
                     </div>
                     <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold capitalize">
                             {event.pipeline_stage ? event.pipeline_stage.replace(/_/g, ' ') : (event.status_code || event.description)}
                          </p>
                          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {format(new Date(event.effective_from || event.timestamp || event.created_at || new Date()), 'HH:mm:ss.SSS')}
                          </span>
                        </div>
                        {event.reason && <p className="text-xs text-muted-foreground mt-1">{event.reason}</p>}
                        {event.actor && <p className="text-xs text-muted-foreground mt-1">Actor: {event.actor}</p>}
                     </div>
                  </div>
               ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">No historical timeline data available for this QC run.</div>
      )}
    </div>
  );
}
