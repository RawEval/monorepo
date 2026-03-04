'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/helpers/formatters';
import { X, Zap, Check, Sparkles, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@raweval/ui/card';
import { paymentsService } from '@/services/payments-service';
import { subscriptionsService } from '@/services/subscriptions-service';
import { openRazorpayCheckout } from '@/lib/razorpay';
import type { SubscriptionPlan, UserModelSubscription } from '@raweval/types';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  // We default to monthly since annual might not be fully supported by the backend yet
  const [billingCycle] = useState<'monthly'>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Dynamic data
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubs, setActiveSubs] = useState<UserModelSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setStatusMsg(null);

    Promise.all([
      subscriptionsService.getPlans(),
      subscriptionsService.getMySubscriptions().catch(() => []),
    ])
      .then(([fetchedPlans, subs]) => {
        setPlans(fetchedPlans);
        setActiveSubs(subs);
      })
      .catch((err) => console.error('Failed to load plans:', err))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const isCurrentPlan = (planId: number): boolean => {
    return activeSubs.some(
      (sub) => sub.plan_id === planId && sub.status === 'active'
    );
  };

  // ---------------------------------------------------------------------------
  // Upgrade handler
  // ---------------------------------------------------------------------------
  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (isCurrentPlan(plan.id) || loadingPlanId) return;

    const priceUsd = plan.monthly_price;
    const amountPaise = Math.round(priceUsd * 83 * 100);

    if (amountPaise === 0) {
      setLoadingPlanId(plan.id);
      try {
        await subscriptionsService.subscribe({
          plan_id: plan.id,
          billing_cycle: billingCycle,
        });
        setStatusMsg({
          type: 'success',
          text: `🎉 Subscribed to ${plan.plan_name}!`,
        });
        const subs = await subscriptionsService.getMySubscriptions();
        setActiveSubs(subs);
        setTimeout(() => onOpenChange(false), 2500);
      } catch (e: any) {
        setStatusMsg({
          type: 'error',
          text: e?.message || 'Failed to subscribe',
        });
      } finally {
        setLoadingPlanId(null);
      }
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';
    if (!razorpayKey) {
      setStatusMsg({
        type: 'error',
        text: 'Payment gateway not configured.',
      });
      return;
    }

    setLoadingPlanId(plan.id);
    setStatusMsg(null);

    try {
      // 1a. Create internal payment intent first
      const pendingPayment = await paymentsService.createPayment({
        amount: amountPaise,
        currency: 'INR',
        payment_type: 'subscription',
        description: `RawEval ${plan.plan_name} Plan (${billingCycle})`,
      });

      // 1b. Create order
      const order = await paymentsService.createRazorpayOrder({
        payment_id: pendingPayment.payment_id,
        amount: amountPaise,
        currency: 'INR',
        notes: `RawEval ${plan.plan_name} Plan (${billingCycle})`,
      });

      // 2. Open Razorpay checkout
      const paymentResult = await openRazorpayCheckout({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpay_order_id,
        name: 'RawEval',
        description: `${plan.plan_name} Plan — Monthly Subscription`,
        theme: { color: '#6366f1' },
      });

      // 3. Verify payment
      await paymentsService.verifyRazorpayPayment({
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
        payment_id: order.payment_id,
      });

      // 4. Subscribe after payment
      await subscriptionsService.subscribe({
        plan_id: plan.id,
        billing_cycle: billingCycle,
        payment_id: paymentResult.razorpay_payment_id,
      });

      setStatusMsg({
        type: 'success',
        text: `🎉 Upgraded to ${plan.plan_name}!`,
      });

      const subs = await subscriptionsService.getMySubscriptions();
      setActiveSubs(subs);
      setTimeout(() => onOpenChange(false), 2500);
    } catch (e: any) {
      const msg: string = e?.message ?? 'Payment failed.';
      if (!msg.toLowerCase().includes('cancelled')) {
        setStatusMsg({ type: 'error', text: `Payment failed: ${msg}` });
      }
    } finally {
      setLoadingPlanId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="border-border bg-background relative my-auto w-full max-w-6xl rounded-xl border p-4 shadow-2xl sm:rounded-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="text-muted-foreground hover:bg-muted absolute top-2 right-2 rounded-lg p-1.5 transition-colors sm:top-4 sm:right-4 sm:p-2"
          aria-label="Close modal"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="border-border bg-muted mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 sm:mb-4 sm:gap-2 sm:px-4 sm:py-2">
            <Sparkles className="text-primary h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="text-foreground text-xs font-medium sm:text-sm">
              Upgrade Plans
            </span>
          </div>
          <h2 className="text-foreground mb-2 text-2xl font-bold sm:text-3xl">
            Choose your plan
          </h2>
          <p className="text-muted-foreground">
            Looking to find out what an upgrade you can get?{' '}
            <button
              onClick={(e) => {
                e.preventDefault();
                onOpenChange(false);
                window.location.href = '/pricing';
              }}
              className="text-primary underline hover:no-underline"
            >
              More details
            </button>
          </p>
        </div>

        {/* Billing Toggle (Removed as per API compatibility check) */}

        {/* Status banner */}
        {statusMsg && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              statusMsg.type === 'success'
                ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
                : 'border-destructive/20 bg-destructive/10 text-destructive'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const price = plan.monthly_price;
              const isPopular = !!plan.is_popular;
              const isCurrent = isCurrentPlan(plan.id);
              const isLoading = loadingPlanId === plan.id;

              // Defensively extract features
              let featureList: string[] = [];
              if (Array.isArray(plan.features)) {
                featureList = plan.features;
              } else if (plan.features && typeof plan.features === 'object') {
                featureList = Object.values(plan.features).filter(
                  (v) => typeof v === 'string'
                ) as string[];
              }

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col transition-all hover:shadow-lg ${
                    isPopular
                      ? 'border-primary shadow-lg md:scale-105'
                      : 'border-border'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="mb-2">
                      <CardTitle className="text-2xl font-bold">
                        {plan.plan_name}
                        {plan.badge_text && (
                          <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                            {plan.badge_text}
                          </span>
                        )}
                      </CardTitle>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-foreground text-4xl font-bold">
                          {formatPrice(price)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /month
                        </span>
                      </div>
                    </div>
                    <CardDescription className="mt-2 text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {featureList.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                          <span className="text-foreground text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      variant={isPopular ? 'default' : 'outline'}
                      className="w-full gap-2"
                      disabled={isCurrent || isLoading || !!loadingPlanId}
                      size="lg"
                      onClick={() => handleUpgrade(plan)}
                    >
                      {isCurrent ? (
                        'Current Plan'
                      ) : isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          {isPopular ? (
                            <Zap className="h-4 w-4" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                          Upgrade to {plan.plan_name}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
