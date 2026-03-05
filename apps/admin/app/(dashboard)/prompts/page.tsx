'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { Button } from '@raweval/ui/button';
import {
  BarChart3,
  Loader2,
  TrendingUp,
  Award,
  ArrowUpDown,
} from 'lucide-react';
import { adminAnalyticsService } from '@/services/admin/analytics-service';
import { adminIAAService } from '@/services/admin/iaa-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { cn } from '@raweval/utils';

type Tab = 'leaderboard' | 'quality' | 'iaa';

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('leaderboard');
  const [tierFilter, setTierFilter] = useState<number | undefined>();

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: queryKeys.analytics.leaderboard(tierFilter),
    queryFn: () => adminAnalyticsService.getExpertLeaderboard(tierFilter, 20),
    enabled: tab === 'leaderboard',
  });

  const { data: qualityTrends, isLoading: trendsLoading } = useQuery({
    queryKey: queryKeys.analytics.qualityTrends(),
    queryFn: () => adminAnalyticsService.getQualityTrends(),
    enabled: tab === 'quality',
  });

  const { data: iaaOverview, isLoading: iaaLoading } = useQuery({
    queryKey: queryKeys.iaa.overview,
    queryFn: () => adminIAAService.getOverview(),
    enabled: tab === 'iaa',
  });

  const { data: tierChanges, isLoading: tierLoading } = useQuery({
    queryKey: queryKeys.analytics.tierChanges,
    queryFn: () => adminAnalyticsService.getTierChangeLog(20),
    enabled: tab === 'quality',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold">
          Analytics & Quality
        </h1>
        <p className="text-muted-foreground text-sm">
          Expert leaderboards, quality trends, and inter-annotator agreement metrics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === 'leaderboard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('leaderboard')}
          className="gap-1.5"
        >
          <Award className="h-4 w-4" />
          Leaderboard
        </Button>
        <Button
          variant={tab === 'quality' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('quality')}
          className="gap-1.5"
        >
          <TrendingUp className="h-4 w-4" />
          Quality & Tiers
        </Button>
        <Button
          variant={tab === 'iaa' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('iaa')}
          className="gap-1.5"
        >
          <BarChart3 className="h-4 w-4" />
          IAA Overview
        </Button>
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={tierFilter ?? ''}
              onChange={(e) => setTierFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="border-input bg-background focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="">All Tiers</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
            </select>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4" />
                Expert Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : leaderboard && Array.isArray(leaderboard) && leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div
                      key={entry.expert_id}
                      className="border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          i === 0 ? 'bg-amber-100 text-amber-700' :
                          i === 1 ? 'bg-gray-100 text-gray-700' :
                          i === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {i + 1}
                        </span>
                        <div>
                          <span className="text-sm font-medium">Expert #{entry.expert_id}</span>
                          <div className="text-muted-foreground flex gap-2 text-xs">
                            <Badge variant="outline" className="text-[10px]">T{entry.tier}</Badge>
                            <span>{entry.tasks_completed} tasks</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-foreground font-mono text-sm font-bold">
                        {entry.score?.toFixed(2) ?? 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">
                  No leaderboard data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quality & Tier Changes */}
      {tab === 'quality' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quality Trends</CardTitle>
              <CardDescription>Recent quality score trends across domains</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : qualityTrends && Array.isArray(qualityTrends) && qualityTrends.length > 0 ? (
                <div className="space-y-2">
                  {qualityTrends.map((trend, i) => (
                    <div key={i} className="border-border flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <span className="text-muted-foreground text-xs">{trend.date}</span>
                        {trend.domain && <Badge variant="outline" className="ml-2 text-[10px]">{trend.domain}</Badge>}
                      </div>
                      <span className="text-foreground font-mono text-sm font-bold">{trend.score?.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">No quality data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowUpDown className="h-4 w-4" />
                Recent Tier Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tierLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : tierChanges && Array.isArray(tierChanges) && tierChanges.length > 0 ? (
                <div className="space-y-2">
                  {tierChanges.map((change, i) => (
                    <div key={i} className="border-border rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Expert #{change.expert_id}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px]">T{change.old_tier}</Badge>
                          <span className="text-muted-foreground text-xs">→</span>
                          <Badge variant="default" className="text-[10px]">T{change.new_tier}</Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">{change.reason}</p>
                      <p className="text-muted-foreground mt-0.5 text-[10px]">
                        {new Date(change.changed_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-12 text-center text-sm">No tier changes</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* IAA Overview */}
      {tab === 'iaa' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inter-Annotator Agreement Overview</CardTitle>
            <CardDescription>System-wide IAA metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {iaaLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            ) : iaaOverview ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(iaaOverview).map(([key, value]) => (
                  <div key={key} className="border-border rounded-lg border p-4">
                    <span className="text-muted-foreground text-xs font-medium uppercase">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <p className="text-foreground mt-1 font-mono text-lg font-bold">
                      {typeof value === 'number' ? value.toFixed(3) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">No IAA data</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
