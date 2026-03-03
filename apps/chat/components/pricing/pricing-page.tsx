'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/helpers/formatters';
import {
  Zap,
  Check,
  Sparkles,
  ArrowLeft,
  Loader2,
  CreditCard,
} from 'lucide-react';
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PricingPage() {
  const router = useRouter();
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
    async function loadData() {
      try {
        const [fetchedPlans, subs] = await Promise.all([
          subscriptionsService.getPlans(),
          subscriptionsService.getMySubscriptions().catch(() => []),
        ]);
        // Defend against APIs returning { subscriptions: [...] } instead of an array
        const plansArray = Array.isArray(fetchedPlans)
          ? fetchedPlans
          : (fetchedPlans as any)?.plans || [];
        const subsArray = Array.isArray(subs)
          ? subs
          : (subs as any)?.subscriptions || [];

        // Sort plans by sort_order
        plansArray.sort(
          (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
        );

        setPlans(plansArray);
        setActiveSubs(subsArray);
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Check if user is already on a plan
  const isCurrentPlan = (planId: number): boolean => {
    return activeSubs.some(
      (sub) => sub.plan_id === planId && sub.status === 'active'
    );
  };

  // ---------------------------------------------------------------------------
  // Upgrade handler — full Razorpay flow + subscribe
  // ---------------------------------------------------------------------------
  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (isCurrentPlan(plan.id) || loadingPlanId) return;

    const priceUsd = plan.monthly_price;

    // Convert USD → paise (INR). Using ~83 exchange rate.
    const amountPaise = Math.round(priceUsd * 83 * 100);

    if (amountPaise === 0) {
      // Free plan — subscribe directly
      setLoadingPlanId(plan.id);
      try {
        await subscriptionsService.subscribe({
          plan_id: plan.id,
          billing_cycle: billingCycle,
        });
        setStatusMsg({
          type: 'success',
          text: `🎉 Successfully subscribed to ${plan.plan_name}!`,
        });
        // Refresh subs
        const newSubs = await subscriptionsService.getMySubscriptions();
        setActiveSubs(
          Array.isArray(newSubs)
            ? newSubs
            : (newSubs as any)?.subscriptions || []
        );
      } catch (e: any) {
        setStatusMsg({
          type: 'error',
          text: `Failed: ${e?.message || 'Unknown error'}`,
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
        text: 'Payment gateway not configured. Please contact support.',
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

      // 1b. Create Razorpay order
      const order = await paymentsService.createRazorpayOrder({
        payment_id: pendingPayment.payment_id,
        amount: amountPaise,
        currency: 'INR',
        description: `RawEval ${plan.plan_name} Plan (${billingCycle})`,
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

      // 4. Subscribe AFTER payment success
      await subscriptionsService.subscribe({
        plan_id: plan.id,
        billing_cycle: billingCycle,
        payment_id: paymentResult.razorpay_payment_id,
      });

      setStatusMsg({
        type: 'success',
        text: `🎉 Successfully upgraded to ${plan.plan_name}! Your plan is now active.`,
      });

      // Refresh subscriptions
      const newSubs = await subscriptionsService.getMySubscriptions();
      setActiveSubs(
        Array.isArray(newSubs) ? newSubs : (newSubs as any)?.subscriptions || []
      );
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
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading plans…</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-background flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="relative mb-8 px-2 text-center sm:mb-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:text-foreground text-muted-foreground absolute top-0 left-0 hidden gap-2 hover:bg-transparent sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="mb-6 flex items-start sm:hidden">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="hover:text-foreground text-muted-foreground gap-2 pl-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="border-border bg-muted mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 sm:mb-4 sm:gap-2 sm:px-4 sm:py-2">
            <Sparkles className="text-primary h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="text-foreground text-xs font-medium sm:text-sm">
              Pricing Plans
            </span>
          </div>
          <h1 className="text-foreground mb-3 text-3xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">
            Choose the perfect plan
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm sm:text-base lg:text-lg">
            Start with our free plan and upgrade as you grow. All plans include
            access to our expert-verified AI.
          </p>
        </div>

        {/* Billing Toggle (Removed as per API compatibility check) */}

        {/* Status message */}
        {statusMsg && (
          <div
            className={`mb-8 rounded-xl border px-4 py-3 text-sm font-medium ${
              statusMsg.type === 'success'
                ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
                : 'border-destructive/20 bg-destructive/10 text-destructive'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Plans Grid */}
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

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-foreground mb-8 text-center text-2xl font-bold">
            Frequently asked questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I change plans later?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes will be reflected in your next billing cycle.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What payment methods do you accept?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  We accept all major credit cards, debit cards, and UPI via
                  Razorpay. Enterprise plans also support invoicing.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Is there a free trial?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Yes! Our free plan is available forever. You can also start a
                  14-day free trial of any paid plan.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What happens if I exceed my limits?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  We'll notify you when you're approaching your limits. You can
                  upgrade your plan or purchase additional credits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
