'use client';

import { X, Sparkles, Shield, Clock, DollarSign, ArrowRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface EarnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EarnModal({ open, onOpenChange }: EarnModalProps) {
  const router = useRouter();

  if (!open) return null;

  const handleOnboard = () => {
    // TODO: Redirect to workbench onboarding when page is created
    // For now, show alert and navigate to experts landing page
    alert('Join the workbench team! This will redirect to the experts onboarding page.');
    // router.push('/experts/onboard');
    onOpenChange(false);
  };

  const handleViewPayouts = () => {
    // Redirect to payouts page
    router.push('/payouts');
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={() => onOpenChange(false)}
    >
      <Card
        className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border-border bg-card shadow-xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        <CardHeader className="border-b border-border pb-4 sm:pb-6 pr-10 sm:pr-12">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl sm:text-2xl">Earn by Helping AI Improve</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1">
                Mark wrong responses and get paid when verified by our workbench team
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-180px)] py-4 sm:py-6 px-4 sm:px-6">
          <div className="space-y-6">
            {/* How It Works */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                How It Works
              </h3>
              <div className="grid gap-4">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <XCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">
                      Mark Responses as Wrong
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      While using RawEval chat, simply click the &quot;Wrong&quot; button on any AI response that you find incorrect or inaccurate.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">
                      Workbench Team Verifies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Our expert workbench team reviews your marked responses and performs QA verification to confirm if they actually failed.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <strong>Want to join the workbench team?</strong> You can also become a reviewer and help verify responses!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">
                      QA Confirms Failure
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      If the QA process confirms that the response actually failed, your contribution is recorded and you&apos;re eligible for payout.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">
                      Receive Payout
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Once QA is complete and the failure is confirmed, you&apos;ll receive payment within a week. Track all your payouts and marked responses on the Payouts page.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Status Flow */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Response Status Flow
              </h3>
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Marked as Wrong
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pending QA
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                    <CheckCircle2 className="h-3 w-3" />
                    QA Approved
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                    <DollarSign className="h-3 w-3" />
                    Paid
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  If QA determines the response was actually correct, it will be marked as &quot;QA Rejected&quot; and you won&apos;t receive payment for that response.
                </p>
              </div>
            </section>

            {/* Payout Timeline */}
            <section className="rounded-lg border border-border bg-muted/30 p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Payout Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    1
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Mark as Wrong:</span> You mark an AI response as incorrect
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    2
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">QA Process:</span> Workbench team reviews and verifies (1-3 days)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    3
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Payment Processing:</span> If approved, funds processed and transferred (up to 1 week)
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-background p-3 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Total Time:</strong> Typically 7-10 days from marking as wrong to receiving payment (if approved)
                  </p>
                </div>
              </div>
            </section>

            {/* Benefits */}
            <section>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Benefits
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Clock,
                    title: 'No Extra Effort',
                    description: 'Just mark wrong responses while you use the chat normally',
                  },
                  {
                    icon: DollarSign,
                    title: 'Fair Compensation',
                    description: 'Get paid for every verified failed prompt you identify',
                  },
                  {
                    icon: Shield,
                    title: 'Help Improve AI',
                    description: 'Your feedback directly improves AI quality for everyone',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Track Everything',
                    description: 'View all your marked responses and payouts in one place',
                  },
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-foreground">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </CardContent>

        {/* Action Footer */}
        <div className="border-t border-border bg-muted/30 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleViewPayouts}
              className="gap-2 w-full sm:w-auto"
            >
              View My Payouts
            </Button>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Want to join the workbench team?
              </p>
              <Button
                onClick={handleOnboard}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
                size="lg"
              >
                Join Workbench
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
