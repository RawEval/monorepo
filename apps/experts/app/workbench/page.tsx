'use client';

import { useState } from 'react';
import { Button } from '@raweval/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@raweval/ui/card';
import { Badge } from '@raweval/ui/badge';
import { formatCurrency } from '@raweval/utils';
import type { ExpertTier } from '@raweval/types';
import {
  Camera,
  Clock,
  DollarSign,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  Keyboard,
  Activity,
  Award,
  Target,
} from 'lucide-react';

export default function ExpertsPage() {
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [tier] = useState<ExpertTier>(2);
  const [earnings] = useState({
    today: 127.5,
    week: 893.25,
    month: 3247.8,
  });

  const tasks = [
    {
      id: 't1',
      prompt: 'Explain the differences between REST and GraphQL APIs...',
      difficulty: 'Medium',
      reward: 8.5,
      status: 'available' as const,
      timeLimit: 45,
    },
    {
      id: 't2',
      prompt: 'Debug this Python code for binary search implementation...',
      difficulty: 'Hard',
      reward: 12.0,
      status: 'available' as const,
      timeLimit: 60,
    },
    {
      id: 't3',
      prompt:
        'Annotate this image with bounding boxes for pedestrian detection...',
      difficulty: 'Easy',
      reward: 4.5,
      status: 'available' as const,
      timeLimit: 30,
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
              <span className="text-lg font-semibold">Expert Workbench</span>
            </div>
            <Badge
              className="gap-1"
              variant={tier === 1 ? 'default' : 'secondary'}
            >
              <Award className="h-3 w-3" />
              Tier {tier} Expert
            </Badge>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-mono text-sm font-semibold text-primary">
                {formatCurrency(earnings.today)}
              </div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
            <Button variant="ghost" size="sm">
              Profile
            </Button>
            <Button size="sm" variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Security Banner */}
      <div className="border-b border-orange-200 bg-orange-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-semibold text-orange-900">
                  Secure Session Active
                </div>
                <div className="text-xs text-orange-700">
                  Camera, screen, and keystroke monitoring enabled • Biometric
                  verification every 60s
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-xs text-green-700">Camera Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-blue-700">Screen Monitored</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Sidebar - Stats */}
          <div className="space-y-6">
            {/* Earnings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                  <div className="text-3xl font-bold font-mono text-primary">
                    {formatCurrency(earnings.today)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Today's earnings
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">This week</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(earnings.week)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">This month</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(earnings.month)}
                    </span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </CardContent>
            </Card>

            {/* Performance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Accuracy Rate
                      </span>
                      <span className="font-mono font-semibold">97.2%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[97.2%] bg-green-500" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tasks Completed
                      </span>
                      <span className="font-mono font-semibold">342</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[68.4%] bg-blue-500" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Response Time</span>
                      <span className="font-mono font-semibold">8.3 min</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[83%] bg-purple-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4" />
                  Live Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Biometric verified</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    38s ago
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <span>Camera monitored</span>
                  <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Keyboard className="h-4 w-4 text-purple-600" />
                  <span>Keystroke analysis</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Normal
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <span>Screen recording</span>
                  <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Available Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Available Tasks
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">3 tasks</Badge>
                    <Button size="sm" variant="outline">
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      activeTask === task.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : ''
                    }`}
                    onClick={() => setActiveTask(task.id)}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge
                              variant={
                                task.difficulty === 'Hard'
                                  ? 'destructive'
                                  : task.difficulty === 'Medium'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {task.difficulty}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {task.timeLimit} min
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">
                            {task.prompt}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="font-mono text-2xl font-bold text-green-600">
                            {formatCurrency(task.reward)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Reward
                          </div>
                        </div>
                      </div>

                      {activeTask === task.id ? (
                        <div className="space-y-4 border-t border-border pt-4">
                          <div className="rounded-lg bg-muted p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              Task Requirements
                            </div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                Camera must remain on throughout task
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                Biometric verification every 60 seconds
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                No copy-paste from external sources
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                Complete within {task.timeLimit} minutes
                              </li>
                            </ul>
                          </div>
                          <div className="flex gap-3">
                            <Button className="flex-1 gap-2" size="lg">
                              <CheckCircle2 className="h-4 w-4" />
                              Start Task ({task.timeLimit} min)
                            </Button>
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTask(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button className="w-full" variant="outline">
                          View Details
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Info Banner */}
            <Card className="mt-6 border-l-4 border-l-blue-500">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Advance to Tier 1</div>
                  <div className="text-sm text-muted-foreground">
                    Complete 50 more tasks with 98%+ accuracy to earn Tier 1
                    status and increase your rewards to $15-25 per task.
                  </div>
                </div>
                <Button variant="outline">Learn More</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
