'use client';

import { Button } from '@raweval/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from '@raweval/utils';
import type { ExpertTier } from '@raweval/types';
import {
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  DollarSign,
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Award,
} from 'lucide-react';

export default function AdminPage() {
  const stats = {
    totalExperts: 1247,
    activeExperts: 892,
    totalPrompts: 45782,
    promptsToday: 1834,
    completedTasks: 39201,
    failedTasks: 2847,
    revenue: 247891.45,
    avgAccuracy: 0.972,
  };

  const recentExperts = [
    {
      id: 'e1',
      name: 'Dr. Sarah Chen',
      tier: 1 as ExpertTier,
      accuracy: 0.984,
      tasksCompleted: 1247,
      earnings: 18429.5,
      status: 'active' as const,
    },
    {
      id: 'e2',
      name: 'Michael Rodriguez',
      tier: 2 as ExpertTier,
      accuracy: 0.971,
      tasksCompleted: 892,
      earnings: 9847.2,
      status: 'active' as const,
    },
    {
      id: 'e3',
      name: 'Dr. Aisha Patel',
      tier: 1 as ExpertTier,
      accuracy: 0.978,
      tasksCompleted: 1109,
      earnings: 16284.75,
      status: 'inactive' as const,
    },
  ];

  const recentTasks = [
    {
      id: 'task1',
      prompt: 'Explain quantum computing principles...',
      expert: 'Dr. Sarah Chen',
      status: 'completed' as const,
      accuracy: 0.98,
      time: '8m 24s',
    },
    {
      id: 'task2',
      prompt: 'Debug Python binary search...',
      expert: 'Michael Rodriguez',
      status: 'in_progress' as const,
      accuracy: null,
      time: '12m 45s',
    },
    {
      id: 'task3',
      prompt: 'Annotate pedestrian detection image...',
      expert: 'Dr. Aisha Patel',
      status: 'failed' as const,
      accuracy: 0.42,
      time: '28m 12s',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-white">R</span>
              </div>
              <span className="text-lg font-semibold">Admin Dashboard</span>
            </div>
            <Badge variant="destructive" className="gap-1">
              <Shield className="h-3 w-3" />
              Internal Only
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm">Admin Profile</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Experts
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="metric text-2xl font-bold">
                {formatNumber(stats.totalExperts)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  +{stats.activeExperts}
                </span>{' '}
                active now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Prompts
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="metric text-2xl font-bold">
                {formatNumber(stats.totalPrompts)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">
                  +{formatNumber(stats.promptsToday)}
                </span>{' '}
                today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="metric text-2xl font-bold">
                {formatCurrency(stats.revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.3%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="metric text-2xl font-bold">
                {formatPercentage(stats.avgAccuracy, 1)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.3%</span> from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Expert Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Expert Management
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExperts.map((expert) => (
                  <div
                    key={expert.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {expert.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{expert.name}</div>
                          <Badge
                            variant={
                              expert.tier === 1
                                ? 'default'
                                : expert.tier === 2
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="h-5 text-xs"
                          >
                            <Award className="mr-1 h-3 w-3" />
                            Tier {expert.tier}
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>
                            {formatPercentage(expert.accuracy, 1)} accuracy
                          </span>
                          <span>•</span>
                          <span>
                            {formatNumber(expert.tasksCompleted)} tasks
                          </span>
                          <span>•</span>
                          <span>{formatCurrency(expert.earnings)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expert.status === 'active' ? (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                          Active
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Inactive
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full">
                View All Experts
              </Button>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Tasks
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Live
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            variant={
                              task.status === 'completed'
                                ? 'default'
                                : task.status === 'in_progress'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className="gap-1"
                          >
                            {task.status === 'completed' && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {task.status === 'in_progress' && (
                              <Clock className="h-3 w-3" />
                            )}
                            {task.status === 'failed' && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {task.time}
                          </span>
                        </div>
                        <p className="mb-1 text-sm">{task.prompt}</p>
                        <p className="text-xs text-muted-foreground">
                          By {task.expert}
                        </p>
                      </div>
                      {task.accuracy !== null && (
                        <div className="ml-4 text-right">
                          <div
                            className={`metric text-lg font-bold ${
                              task.accuracy >= 0.9
                                ? 'text-green-600'
                                : task.accuracy >= 0.7
                                  ? 'text-orange-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {formatPercentage(task.accuracy, 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Accuracy
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full">
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Task Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Task Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="metric font-semibold">
                    {formatNumber(stats.completedTasks)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[85%] bg-green-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="metric font-semibold">1,734</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[8%] bg-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Failed</span>
                  <span className="metric font-semibold">
                    {formatNumber(stats.failedTasks)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[7%] bg-red-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
