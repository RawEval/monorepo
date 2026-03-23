import { useCallback, useState } from 'react';
import { logger } from '@/lib/logger';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import RazorpayCheckout from 'react-native-razorpay';

import { colors, spacing, radius, fontSize, fonts, letterSpacing } from '@/constants/tokens';
import { subscriptionsService } from '@/services/subscriptions-service';
import { paymentsService } from '@/services/payments-service';
import { subscriptionKeys } from '@/lib/react-query/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import type { SubscriptionPlan, UserModelSubscription } from '@raweval/types';

const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? '';
const USD_TO_INR = 83;

// ---------------------------------------------------------------------------
// Plan Card
// ---------------------------------------------------------------------------

function PlanCard({
  plan,
  state,
  onSubscribe,
  isProcessing,
}: {
  plan: SubscriptionPlan;
  state: 'available' | 'current' | 'included';
  onSubscribe: (plan: SubscriptionPlan) => void;
  isProcessing: boolean;
}) {
  const isFree = plan.monthly_price === 0;
  const isPopular = plan.is_popular;

  const features: string[] = Array.isArray(plan.features)
    ? plan.features
    : plan.features
      ? Object.entries(plan.features).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '))
      : [];

  // Add auto-generated features from plan fields
  const autoFeatures: string[] = [];
  if (plan.web_search_enabled) autoFeatures.push('Web search');
  if (plan.file_upload_enabled) autoFeatures.push('File uploads');
  if (plan.api_access) autoFeatures.push('API access');
  if (plan.priority_support) autoFeatures.push('Priority support');
  if (plan.max_daily_messages > 0 && plan.max_daily_messages < 9999) {
    autoFeatures.push(`${plan.max_daily_messages} messages/day`);
  } else if (plan.max_daily_messages < 0 || plan.max_daily_messages >= 9999) {
    autoFeatures.push('Unlimited messages');
  }

  const allFeatures = [...features, ...autoFeatures.filter((f) => !features.some((ef) => ef.toLowerCase().includes(f.toLowerCase())))];

  let btnLabel = 'Subscribe';
  let btnDisabled = false;
  if (state === 'current') { btnLabel = 'Current Plan'; btnDisabled = true; }
  if (state === 'included') { btnLabel = 'Included'; btnDisabled = true; }

  return (
    <View style={[s.card, state === 'current' && s.cardCurrent, isPopular && s.cardPopular]}>
      {/* Badges */}
      {(isPopular || (plan.badge_text != null && plan.badge_text !== '')) ? (
        <View style={s.badgeRow}>
          {isPopular ? (
            <View style={s.popularBadge}><Text style={s.popularTxt}>Popular</Text></View>
          ) : null}
          {plan.badge_text != null && plan.badge_text !== '' ? (
            <View style={s.typeBadge}><Text style={s.typeTxt}>{String(plan.badge_text)}</Text></View>
          ) : null}
        </View>
      ) : null}

      {/* Name + Price */}
      <Text style={s.planName}>{plan.plan_name}</Text>
      {plan.description ? <Text style={s.planDesc}>{plan.description}</Text> : null}

      <View style={s.priceRow}>
        <Text style={s.priceAmount}>{isFree ? 'Free' : `$${plan.monthly_price}`}</Text>
        {!isFree ? <Text style={s.pricePeriod}>/month</Text> : null}
      </View>

      {/* Features */}
      {allFeatures.length > 0 ? (
        <View style={s.features}>
          {allFeatures.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Text style={s.featureCheck}>✓</Text>
              <Text style={s.featureTxt}>{f}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Subscribe button */}
      <Pressable
        style={({ pressed }) => [
          s.subscribeBtn,
          state === 'current' && s.subscribeBtnCurrent,
          state === 'included' && s.subscribeBtnIncluded,
          (btnDisabled || isProcessing) && s.subscribeBtnDisabled,
          pressed && !btnDisabled && s.subscribeBtnPressed,
        ]}
        onPress={() => onSubscribe(plan)}
        disabled={btnDisabled || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={[s.subscribeTxt, (state === 'current' || state === 'included') && s.subscribeTxtMuted]}>
            {btnLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function PricingScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: () => subscriptionsService.getPlans(),
  });

  const { data: subs, isLoading: subsLoading } = useQuery({
    queryKey: subscriptionKeys.mine(),
    queryFn: () => subscriptionsService.getMySubscriptions(),
  });

  const isLoading = plansLoading || subsLoading;
  const activeSubs = (subs ?? []).filter((sub: UserModelSubscription) => sub.status === 'active');
  const activePlanIds = new Set(activeSubs.map((sub: UserModelSubscription) => sub.plan_id));
  const hasUltimate = activeSubs.some((sub: UserModelSubscription) => sub.plan?.plan_type === 'ultimate');

  const getPlanState = useCallback(
    (plan: SubscriptionPlan): 'available' | 'current' | 'included' => {
      if (activePlanIds.has(plan.id)) return 'current';
      if (hasUltimate && plan.plan_type === 'premium_model') return 'included';
      return 'available';
    },
    [activePlanIds, hasUltimate],
  );

  const handleSubscribe = useCallback(
    async (plan: SubscriptionPlan) => {
      setStatus(null);
      setProcessingPlanId(plan.id);

      try {
        // Free plan — subscribe directly
        if (plan.monthly_price === 0) {
          await subscriptionsService.subscribe({ plan_id: plan.id, billing_cycle: 'monthly' });
          setStatus({ type: 'success', message: `Subscribed to ${plan.plan_name}!` });
          queryClient.invalidateQueries({ queryKey: subscriptionKeys.mine() });
          setProcessingPlanId(null);
          return;
        }

        // Paid plan — native Razorpay SDK
        if (!RAZORPAY_KEY) {
          setStatus({ type: 'error', message: 'Razorpay is not configured. Please contact support.' });
          setProcessingPlanId(null);
          return;
        }
        logger.log('[Pricing] Starting payment for plan:', plan.plan_name, 'price:', plan.monthly_price, 'key:', RAZORPAY_KEY.slice(0, 8) + '...');

        // 1) Create payment intent
        const payment = await paymentsService.createPayment({
          amount: plan.monthly_price,
          currency: 'USD',
          payment_type: 'subscription',
          description: `${plan.plan_name} - Monthly`,
        });

        logger.log('[Pricing] Payment created:', JSON.stringify(payment));

        // 2) Create Razorpay order (convert USD to INR paise)
        const amountInPaise = Math.round(plan.monthly_price * USD_TO_INR * 100);
        const order = await paymentsService.createRazorpayOrder({
          amount: amountInPaise,
          currency: 'INR',
          payment_id: payment.payment_id,
          notes: { description: `RawEval ${plan.plan_name} Plan (monthly)` },
        });

        logger.log('[Pricing] Order created:', JSON.stringify(order));

        // 3) Open native Razorpay checkout
        const userEmail = user?.email || 'user@raweval.com';
        const userName = user?.full_name || 'RawEval User';
        const rzpOptions = {
          key: RAZORPAY_KEY,
          amount: order.amount,
          currency: order.currency,
          name: 'RawEval',
          description: `${plan.plan_name} Subscription`,
          order_id: order.razorpay_order_id,
          prefill: {
            email: userEmail,
            name: userName,
            contact: '',
          },
          theme: { color: '#FF6B35' },
        };
        logger.log('[Pricing] Razorpay options:', JSON.stringify(rzpOptions));
        const rzpResponse = await RazorpayCheckout.open(rzpOptions);

        // 4) Verify payment signature
        await paymentsService.verifyRazorpayPayment({
          razorpay_order_id: rzpResponse.razorpay_order_id,
          razorpay_payment_id: rzpResponse.razorpay_payment_id,
          razorpay_signature: rzpResponse.razorpay_signature,
          payment_id: order.payment_id,
        } as Parameters<typeof paymentsService.verifyRazorpayPayment>[0]);

        // 5) Subscribe
        await subscriptionsService.subscribe({
          plan_id: plan.id,
          billing_cycle: 'monthly',
          payment_id: rzpResponse.razorpay_payment_id,
        });

        setStatus({ type: 'success', message: `Successfully subscribed to ${plan.plan_name}!` });
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.mine() });
      } catch (err: unknown) {
        logger.error('[Pricing] Subscribe error:', JSON.stringify(err));
        // Razorpay native SDK errors have { code, description, details }
        const rzpErr = err as { code?: number; description?: string; details?: Record<string, unknown> };
        if (rzpErr.code !== undefined && rzpErr.description) {
          // Razorpay error
          if (rzpErr.code === 0 || rzpErr.description?.includes('cancelled') || rzpErr.description?.includes('dismiss')) {
            setStatus({ type: 'error', message: 'Payment cancelled.' });
          } else {
            setStatus({ type: 'error', message: `Payment failed: ${rzpErr.description}` });
          }
        } else {
          const msg = err instanceof Error ? err.message : 'Payment failed. Please try again.';
          if (msg.includes('401') || msg.includes('expired') || msg.includes('credentials')) {
            setStatus({ type: 'error', message: 'Session expired. Please go back and try again.' });
          } else {
            setStatus({ type: 'error', message: msg });
          }
        }
      } finally {
        setProcessingPlanId(null);
      }
    },
    [user, queryClient],
  );

  const sortedPlans = (plans ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Choose your plan</Text>
          <Text style={s.headerSub}>Upgrade for more models, web search, and priority support</Text>
        </View>

        {/* Status message */}
        {status ? (
          <View style={[s.statusBar, status.type === 'success' ? s.statusSuccess : s.statusError]}>
            <Text style={[s.statusTxt, status.type === 'success' ? s.statusSuccessTxt : s.statusErrorTxt]}>
              {status.message}
            </Text>
          </View>
        ) : null}

        {/* Loading */}
        {isLoading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={colors.signal} />
          </View>
        ) : null}

        {/* Plans */}
        {!isLoading && sortedPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            state={getPlanState(plan)}
            onSubscribe={handleSubscribe}
            isProcessing={processingPlanId === plan.id}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgBase },
  scroll: { padding: spacing[4], gap: spacing[4], paddingBottom: spacing[20] },

  // Header
  header: { gap: spacing[2], paddingVertical: spacing[2] },
  headerTitle: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700' },
  headerSub: { color: colors.textSecondary, fontSize: fontSize.sm },

  // Status
  statusBar: { padding: spacing[3], borderRadius: radius.md, borderCurve: 'continuous' },
  statusSuccess: { backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  statusError: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  statusTxt: { fontSize: fontSize.sm },
  statusSuccessTxt: { color: colors.success },
  statusErrorTxt: { color: colors.error },

  loadingWrap: { paddingVertical: spacing[12], alignItems: 'center' },

  // Card
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
    gap: spacing[4],
  },
  cardCurrent: { borderColor: colors.signal, borderWidth: 2 },
  cardPopular: { borderColor: colors.signal },

  badgeRow: { flexDirection: 'row', gap: spacing[2] },
  popularBadge: { backgroundColor: colors.signal, borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: 3 },
  popularTxt: { color: '#fff', fontSize: 11, fontWeight: '700', fontFamily: fonts.mono },
  typeBadge: { backgroundColor: colors.bgMuted, borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: 3 },
  typeTxt: { color: colors.textSecondary, fontSize: 11, fontFamily: fonts.mono },

  planName: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  planDesc: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: -spacing[2] },

  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  priceAmount: { color: colors.signal, fontSize: fontSize['2xl'], fontFamily: fonts.monoMedium },
  pricePeriod: { color: colors.textMuted, fontSize: fontSize.sm, fontFamily: fonts.mono, marginLeft: spacing[1] },

  features: { gap: spacing[2] },
  featureRow: { flexDirection: 'row', gap: spacing[2], alignItems: 'flex-start' },
  featureCheck: { color: colors.success, fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.5 },
  featureTxt: { color: colors.textSecondary, fontSize: fontSize.sm, flex: 1, lineHeight: fontSize.sm * 1.5 },

  // Subscribe button
  subscribeBtn: {
    backgroundColor: colors.signal,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  subscribeBtnCurrent: { backgroundColor: colors.bgMuted },
  subscribeBtnIncluded: { backgroundColor: colors.bgMuted },
  subscribeBtnDisabled: { opacity: 0.6 },
  subscribeBtnPressed: { opacity: 0.85 },
  subscribeTxt: { color: '#fff', fontSize: fontSize.base, fontWeight: '600' },
  subscribeTxtMuted: { color: colors.textMuted },
});
