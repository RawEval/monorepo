import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { colors, spacing, radius, fontSize, fonts, letterSpacing } from '@/constants/tokens';
import { PromptModal } from '@/components/prompt-modal';
import { BankAccountModal } from '@/components/bank-account-modal';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectsStore } from '@/stores/projects-store';
import { useWalletBalance, useWalletTransactions } from '@/features/wallet/api/get-wallet';
import { walletService } from '@/services/wallet-service';
import { paymentsService } from '@/services/payments-service';
import { usePayoutsData } from '@/features/payouts/api/get-payouts';
import { subscriptionsService } from '@/services/subscriptions-service';
import { usersService } from '@/services/users-service';
import { qcService } from '@/services/qc-service';
import { subscriptionKeys } from '@/lib/react-query/query-keys';
import { formatCurrency, timeAgo } from '@/helpers/formatters';
import type { UserModelSubscription, ApiKey, Transaction } from '@raweval/types';

// ---------------------------------------------------------------------------
// Verdict config matching web exactly
// ---------------------------------------------------------------------------
const VERDICTS: Record<string, { label: string; color: string }> = {
  true_failure: { label: 'Confirmed', color: colors.success },
  false_positive: { label: 'False Positive', color: '#9CA3AF' },
  needs_human_review: { label: 'Under Review', color: colors.info },
  analysis_in_progress: { label: 'Analyzing', color: colors.info },
  analysis_pending: { label: 'Queued', color: '#9CA3AF' },
  marked_as_failed: { label: 'Marked', color: '#9CA3AF' },
  completed: { label: 'Paid', color: colors.success },
  pending: { label: 'Pending QA', color: colors.warning },
  failed: { label: 'Rejected', color: colors.error },
};

const VERDICT_BANNERS: Record<string, { text: string; color: string }> = {
  true_failure: { text: '✓ Confirmed failure — $1.00 credited to your wallet', color: colors.success },
  false_positive: { text: 'Our analysis found the AI response was correct', color: '#9CA3AF' },
  needs_human_review: { text: 'Escalated for human review — verdict pending', color: colors.info },
};

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
export default function AccountScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [section, setSection] = useState<'main' | 'wallet' | 'payouts'>('main');
  const [pwVisible, setPwVisible] = useState(false);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [disputeId, setDisputeId] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [promptConfig, setPromptConfig] = useState<{ title: string; message: string; defaultValue?: string; onSubmit: (v: string) => void } | null>(null);
  const [disputing, setDisputing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);

  const navigation = useNavigation();

  // Update header title based on sub-section + handle back
  useEffect(() => {
    const titles: Record<string, string> = { main: 'Account', wallet: 'Wallet', payouts: 'Payouts & Earnings' };
    navigation.setOptions({
      title: titles[section] ?? 'Account',
      headerLeft: () => (
        <Pressable
          onPress={() => {
            if (section !== 'main') setSection('main');
            else router.back();
          }}
          style={{ marginLeft: spacing[3], padding: spacing[1] }}
          hitSlop={8}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: '300', lineHeight: 34 }}>‹</Text>
        </Pressable>
      ),
    });
  }, [section, navigation]);

  // Reset modals when switching sections
  useEffect(() => {
    setBankModalVisible(false);
    setPromptConfig(null);
    setDisputeId(null);
    setDisputeReason('');
    setPwVisible(false);
  }, [section]);

  // Android hardware back
  useEffect(() => {
    const handler = () => {
      // Close modals first
      if (bankModalVisible) { setBankModalVisible(false); return true; }
      if (promptConfig) { setPromptConfig(null); return true; }
      if (disputeId !== null) { setDisputeId(null); setDisputeReason(''); return true; }
      if (section !== 'main') { setSection('main'); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [section, bankModalVisible, promptConfig, disputeId]);

  const { data: subs } = useQuery({ queryKey: subscriptionKeys.mine(), queryFn: () => subscriptionsService.getMySubscriptions() });
  const { data: apiKeys, refetch: refetchKeys } = useQuery<ApiKey[]>({ queryKey: ['api-keys'], queryFn: () => subscriptionsService.getApiKeys() });
  const { data: wallet } = useWalletBalance();
  const { data: txns } = useWalletTransactions();
  const { data: payouts, refetch: refetchPayouts } = usePayoutsData();

  const initials = user?.full_name ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const hasBalance = (wallet?.available_balance ?? 0) > 0 || (wallet?.pending_balance ?? 0) > 0 || (wallet?.total_earned ?? 0) > 0;

  // Handlers
  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  }, [logout]);

  const handleCreateKey = useCallback(() => {
    setPromptConfig({
      title: 'New API Key',
      message: 'Enter a name for this key:',
      onSubmit: async (name: string) => {
        try {
          const r = await subscriptionsService.createApiKey({ name });
          if (r.full_key) { await Clipboard.setStringAsync(r.full_key); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
          Alert.alert('Key Created', r.full_key ? `Copied:\n${r.full_key}` : 'Done.');
          refetchKeys();
        } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
      },
    });
  }, [refetchKeys]);

  const handleDeleteKey = useCallback((key: ApiKey) => {
    Alert.alert('Revoke Key', `Revoke "${key.name ?? 'Key'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: async () => { await subscriptionsService.deleteApiKey(key.id); refetchKeys(); } },
    ]);
  }, [refetchKeys]);

  const handleChangePw = useCallback(async () => {
    if (!curPw || !newPw) return Alert.alert('Error', 'Fill in both fields.');
    if (newPw.length < 8) return Alert.alert('Error', '8+ characters required.');
    setChangingPw(true);
    try { await usersService.changePassword({ current_password: curPw, new_password: newPw }); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert('Done', 'Password changed.'); setPwVisible(false); setCurPw(''); setNewPw(''); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
    finally { setChangingPw(false); }
  }, [curPw, newPw]);

  const handleDispute = useCallback(async () => {
    if (!disputeId || disputeReason.length < 10) return Alert.alert('Error', 'Provide at least 10 characters.');
    setDisputing(true);
    try { await qcService.createDispute(disputeId, disputeReason); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert('Submitted', 'A senior reviewer will evaluate.'); setDisputeId(null); setDisputeReason(''); refetchPayouts(); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Failed'); }
    finally { setDisputing(false); }
  }, [disputeId, disputeReason, refetchPayouts]);

  const handleWithdraw = useCallback(async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return Alert.alert('Error', 'Enter a valid amount.');
    if (amount > (wallet?.available_balance ?? 0)) return Alert.alert('Error', 'Insufficient balance.');
    setWithdrawing(true);
    try {
      await walletService.withdrawRazorpay(amount, 'Wallet withdrawal');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Withdrawal Requested', 'Funds will arrive in 1-3 business days.');
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    } catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Withdrawal failed.'); }
    finally { setWithdrawing(false); }
  }, [withdrawAmount, wallet, queryClient]);

  const handleAddBankSubmit = useCallback(async (data: {
    account_type: 'indian_bank' | 'foreign_bank';
    account_holder_name: string;
    account_number: string;
    routing_number: string;
    bank_name: string;
    country: string;
    currency: string;
  }) => {
    await paymentsService.createBankAccount(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Done', 'Bank account added.');
    refetchPayouts();
  }, [refetchPayouts]);

  const openChat = useCallback((id: number) => {
    useProjectsStore.getState().selectProject(String(id));
    router.push('/(app)');
  }, []);

  // -------------------------------------------------------------------------
  // SUB-PAGES: Wallet History / Payouts
  // -------------------------------------------------------------------------
  if (section === 'wallet') {
    return (
      <SafeAreaView style={s.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={s.subPage} showsVerticalScrollIndicator={false}>
          {/* Balance */}
          <View style={s.balRow}>
            <Bal label="Available" amount={wallet?.available_balance ?? 0} color={colors.signal} />
            <Bal label="Pending" amount={wallet?.pending_balance ?? 0} color={colors.warning} />
          </View>

          {/* Transactions */}
          <Text style={s.sectionLabel}>Recent Activity</Text>
          {(txns ?? []).length > 0 ? (
            <View style={s.card}>
              {(txns ?? []).map((t: Transaction) => {
                const credit = t.amount >= 0;
                const sc = t.status === 'completed' ? colors.success : t.status === 'failed' ? colors.error : colors.warning;
                return (
                  <View key={t.id} style={s.txnRow}>
                    <View style={s.txnLeft}>
                      <Text style={s.txnType}>{t.transaction_type.replace(/_/g, ' ')}</Text>
                      <Text style={s.txnDetail}>{t.description || timeAgo(t.created_at)}</Text>
                    </View>
                    <View style={s.txnRight}>
                      <Text style={[s.txnAmount, { color: credit ? colors.success : colors.error }]}>{credit ? '+' : '−'}{formatCurrency(Math.abs(t.amount))}</Text>
                      <Text style={[s.txnStatus, { color: sc }]}>{t.status}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Text style={s.emptyTitle}>No transactions yet</Text>
              <Text style={s.emptySub}>Your transaction history will appear here once you start using RawEval.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (section === 'payouts') {
    const payments = payouts?.payments ?? [];
    return (
      <SafeAreaView style={s.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={s.subPage} showsVerticalScrollIndicator={false}>
          {/* Earnings summary */}
          {payouts?.earnings ? (
            <View style={s.balRow}>
              <Bal label="Total Earned" amount={payouts.earnings.total_earned} color={colors.success} />
              <Bal label="Pending" amount={payouts.earnings.pending_earnings} color={colors.warning} />
            </View>
          ) : null}

          {/* Withdraw */}
          {(wallet?.available_balance ?? 0) > 0 ? (
            <>
              <Text style={s.sectionLabel}>Withdraw</Text>
              <View style={s.card}>
                <View style={s.withdrawRow}>
                  <TextInput
                    style={s.withdrawInput}
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    placeholder="Amount (USD)"
                    placeholderTextColor={colors.textFaint}
                    keyboardType="decimal-pad"
                  />
                  <Pressable style={[s.submitBtn, withdrawing && s.disabled]} onPress={handleWithdraw} disabled={withdrawing}>
                    <Text style={s.submitBtnTxt}>{withdrawing ? '...' : 'Withdraw'}</Text>
                  </Pressable>
                </View>
              </View>
            </>
          ) : null}

          {/* Bank Accounts */}
          <Text style={s.sectionLabel}>Bank Accounts</Text>
          <View style={s.card}>
            {(payouts?.bankAccounts ?? []).length > 0 ? (
              (payouts?.bankAccounts ?? []).map((acc) => (
                <MenuItem key={acc.id} label={acc.account_holder_name} detail={`••••${acc.account_number_last4} · ${acc.bank_name}`} />
              ))
            ) : (
              <MenuItem label="No accounts yet" />
            )}
            <MenuItem label="Add Bank Account" onPress={() => setBankModalVisible(true)} />
          </View>

          {/* Flagged conversations */}
          <Text style={s.sectionLabel}>Flagged Conversations</Text>
          {payments.length > 0 ? (
            <View style={s.card}>
              {payments.map((p) => {
                const v = VERDICTS[p.qcStatus ?? ''] ?? { label: 'Processing', color: '#9CA3AF' };
                const banner = VERDICT_BANNERS[p.qcStatus ?? ''];
                const isDisputed = p.qcStatus === 'disputed' || p.qcStatus === 'qc_wrong' || p.qcStatus === 'qc_disputed';
                const canDispute = p.qcStatus === 'false_positive' && !isDisputed;

                return (
                  <View key={p.id} style={s.payoutRow}>
                    <Pressable style={({ pressed }) => [s.payoutInner, pressed && s.pressed]} onPress={() => openChat(p.id)}>
                      <View style={s.payoutTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.payoutTitle} numberOfLines={1}>{p.title}</Text>
                          <Text style={s.payoutMeta}>#{p.id} · {timeAgo(p.createdAt)}</Text>
                        </View>
                        <Badge label={v.label} color={v.color} />
                      </View>
                      {banner ? <Text style={[s.bannerTxt, { color: banner.color, marginTop: spacing[1] }]}>{banner.text}</Text> : null}
                      {isDisputed ? <Text style={[s.bannerTxt, { color: colors.info, marginTop: spacing[1] }]}>Dispute submitted — under review</Text> : null}
                      {p.payoutEligible ? <Text style={[s.bannerTxt, { color: colors.success, marginTop: spacing[1] }]}>$1.00 credited to wallet</Text> : null}
                    </Pressable>
                    {canDispute ? (
                      <Pressable style={s.disputeBtn} onPress={() => setDisputeId(p.id)}>
                        <Text style={s.disputeBtnTxt}>Dispute</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={s.emptyCard}>
              <Text style={s.emptyTitle}>No flagged conversations</Text>
              <Text style={s.emptySub}>Mark AI responses as wrong in chat to start earning. Our QC team verifies each report.</Text>
            </View>
          )}

          {/* Dispute form */}
          {disputeId !== null ? (
            <View style={s.disputeForm}>
              <Text style={s.disputeFormTitle}>Dispute Decision</Text>
              <Text style={s.disputeFormDesc}>Our analysis found the AI response was correct. If you disagree, provide your reasoning below.</Text>
              <TextInput style={s.disputeInput} value={disputeReason} onChangeText={setDisputeReason} placeholder="Why do you disagree? (min 10 chars)" placeholderTextColor={colors.textFaint} multiline maxLength={500} textAlignVertical="top" />
              <Text style={s.charCount}>{disputeReason.length}/500</Text>
              <View style={s.disputeActions}>
                <Pressable onPress={() => { setDisputeId(null); setDisputeReason(''); }}><Text style={s.cancelTxt}>Cancel</Text></Pressable>
                <Pressable style={[s.submitBtn, disputeReason.length < 10 && s.disabled]} onPress={handleDispute} disabled={disputing || disputeReason.length < 10}>
                  <Text style={s.submitBtnTxt}>{disputing ? 'Submitting...' : 'Submit Dispute'}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN ACCOUNT PAGE
  // -------------------------------------------------------------------------
  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <View style={s.profile}>
          <View style={s.avatar}><Text style={s.avatarTxt}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{user?.full_name ?? 'User'}</Text>
            <Text style={s.email}>{user?.email ?? ''}</Text>
          </View>
        </View>

        {/* Quick stats — only show if there's actual data */}
        {hasBalance ? (
          <View style={s.balRow}>
            <Bal label="Available" amount={wallet?.available_balance ?? 0} color={colors.signal} />
            <Bal label="Earned" amount={wallet?.total_earned ?? 0} color={colors.success} />
          </View>
        ) : null}

        {/* Menu items */}
        <View style={s.menu}>
          <MenuItem label="Wallet & Transactions" detail={hasBalance ? formatCurrency(wallet?.available_balance ?? 0) : undefined} onPress={() => setSection('wallet')} />
          <MenuItem label="Payouts & Earnings" detail={payouts?.payments?.length ? `${payouts.payments.length} flagged` : undefined} onPress={() => setSection('payouts')} />
          <MenuItem label="Subscription" detail={(subs ?? [])[0]?.plan?.plan_name ?? 'Free'} onPress={() => router.push('/(app)/pricing')} />
        </View>

        {/* API Keys */}
        <SectionLabel>API Keys</SectionLabel>
        <View style={s.card}>
          {(apiKeys ?? []).map((key: ApiKey) => (
            <MenuItem key={key.id} label={key.name ?? `Key ${key.id}`} detail={`••••${key.key_prefix}`} onPress={() => handleDeleteKey(key)} />
          ))}
          <MenuItem label="Create New Key" onPress={handleCreateKey} />
        </View>

        {/* Security */}
        <SectionLabel>Security</SectionLabel>
        <View style={s.card}>
          {pwVisible ? (
            <View style={s.pwForm}>
              <TextInput style={s.input} placeholder="Current password" placeholderTextColor={colors.textFaint} secureTextEntry value={curPw} onChangeText={setCurPw} autoCapitalize="none" />
              <TextInput style={s.input} placeholder="New password (8+ chars)" placeholderTextColor={colors.textFaint} secureTextEntry value={newPw} onChangeText={setNewPw} autoCapitalize="none" />
              <View style={s.pwActions}>
                <Pressable onPress={() => { setPwVisible(false); setCurPw(''); setNewPw(''); }}><Text style={s.cancelTxt}>Cancel</Text></Pressable>
                <Pressable style={[s.submitBtn, changingPw && s.disabled]} onPress={handleChangePw} disabled={changingPw}>
                  <Text style={s.submitBtnTxt}>{changingPw ? 'Changing...' : 'Change'}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <MenuItem label="Change Password" onPress={() => setPwVisible(true)} />
          )}
        </View>

        {/* Legal */}
        <SectionLabel>Legal</SectionLabel>
        <View style={s.card}>
          <MenuItem label="Privacy Policy" onPress={() => { const WebBrowser = require('expo-web-browser'); WebBrowser.openBrowserAsync('https://raweval.com/privacy'); }} />
          <MenuItem label="Terms of Service" onPress={() => { const WebBrowser = require('expo-web-browser'); WebBrowser.openBrowserAsync('https://raweval.com/terms'); }} />
        </View>

        {/* App */}
        <SectionLabel>App</SectionLabel>
        <View style={s.card}>
          <MenuItem label="Version" detail={Constants.expoConfig?.version ?? '0.1.0'} />
        </View>

        {/* Sign out */}
        <Pressable style={({ pressed }) => [s.logoutBtn, pressed && s.pressed]} onPress={handleLogout}>
          <Text style={s.logoutTxt}>Sign Out</Text>
        </Pressable>

        {/* Delete account — required by App Store */}
        <Pressable
          style={({ pressed }) => [s.deleteBtn, pressed && s.pressed]}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'This will permanently delete your account and all data. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete My Account',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Confirm Deletion', 'Type DELETE to confirm.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Confirm',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await usersService.deleteAccount();
                          } catch { /* best effort */ }
                          await logout();
                          router.replace('/(auth)/login');
                        },
                      },
                    ]);
                  },
                },
              ]
            );
          }}
        >
          <Text style={s.deleteTxt}>Delete Account</Text>
        </Pressable>

      </ScrollView>

      <PromptModal
        visible={promptConfig !== null}
        title={promptConfig?.title ?? ''}
        message={promptConfig?.message ?? ''}
        defaultValue={promptConfig?.defaultValue}
        onSubmit={(v) => { promptConfig?.onSubmit(v); setPromptConfig(null); }}
        onCancel={() => setPromptConfig(null)}
      />
      <BankAccountModal
        visible={bankModalVisible}
        onClose={() => setBankModalVisible(false)}
        onSubmit={handleAddBankSubmit}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: string }) {
  return <Text style={s.sectionLabel}>{children}</Text>;
}

function MenuItem({ label, detail, onPress }: { label: string; detail?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.menuItem, pressed && onPress && s.pressed]}>
      <Text style={s.menuLabel}>{label}</Text>
      <View style={s.menuRight}>
        {detail ? <Text style={s.menuDetail}>{detail}</Text> : null}
        {onPress ? <Text style={s.menuChevron}>›</Text> : null}
      </View>
    </Pressable>
  );
}

function Bal({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <View style={s.bal}>
      <Text style={s.balLabel}>{label}</Text>
      <Text style={[s.balAmount, { color }]}>{formatCurrency(amount)}</Text>
    </View>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '18' }]}>
      <Text style={[s.badgeTxt, { color }]}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgBase },
  page: { paddingHorizontal: spacing[5], paddingBottom: spacing[20] },
  subPage: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[20] },

  // Profile
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingVertical: spacing[5] },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.signal, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
  name: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  email: { color: colors.textMuted, fontSize: fontSize.sm },

  // Balance
  balRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
  bal: { flex: 1, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderCurve: 'continuous', padding: spacing[4], gap: spacing[1] },
  balLabel: { color: colors.textMuted, fontSize: 11, fontFamily: fonts.mono, textTransform: 'uppercase', letterSpacing: letterSpacing.wide },
  balAmount: { fontSize: fontSize.lg, fontFamily: fonts.monoMedium },

  // Menu
  menu: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden', marginBottom: spacing[5] },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[4], paddingHorizontal: spacing[4], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  menuLabel: { color: colors.textPrimary, fontSize: fontSize.base },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  menuDetail: { color: colors.textMuted, fontSize: fontSize.sm, fontFamily: fonts.mono },
  menuChevron: { color: colors.textMuted, fontSize: 20, fontWeight: '300' },

  // Section
  sectionLabel: { color: colors.textFaint, fontSize: 11, fontFamily: fonts.monoMedium, textTransform: 'uppercase', letterSpacing: letterSpacing.wider, marginBottom: spacing[2], marginTop: spacing[2] },
  card: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden', marginBottom: spacing[4] },

  // Payout cards
  payoutRow: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  payoutInner: { padding: spacing[4] },
  payoutTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  payoutTitle: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '500' },
  payoutMeta: { color: colors.textFaint, fontSize: fontSize.xs, fontFamily: fonts.mono, marginTop: 2 },
  viewLink: { color: colors.signal, fontSize: fontSize.xs, fontFamily: fonts.mono, marginTop: spacing[2] },
  banner: { marginTop: spacing[2], padding: spacing[2], borderRadius: radius.sm },
  bannerTxt: { fontSize: fontSize.xs },
  disputeBtn: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, padding: spacing[3], alignItems: 'center' },
  disputeBtnTxt: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '600' },

  // Dispute form
  disputeForm: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing[4], gap: spacing[3], marginBottom: spacing[3], borderWidth: 1, borderColor: colors.warning + '30' },
  disputeFormTitle: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '600' },
  disputeFormDesc: { color: colors.textSecondary, fontSize: fontSize.sm },
  disputeInput: { backgroundColor: colors.bgMuted, borderRadius: radius.md, padding: spacing[3], color: colors.textPrimary, fontSize: fontSize.base, minHeight: 80 },
  charCount: { color: colors.textFaint, fontSize: fontSize.xs, fontFamily: fonts.mono, textAlign: 'right' },
  disputeActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Transactions
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  txnLeft: { flex: 1, gap: 1 },
  txnType: { color: colors.textPrimary, fontSize: fontSize.sm, textTransform: 'capitalize' },
  txnDetail: { color: colors.textFaint, fontSize: fontSize.xs, fontFamily: fonts.mono },
  txnRight: { alignItems: 'flex-end', gap: 1 },
  txnAmount: { fontSize: fontSize.sm, fontFamily: fonts.monoMedium },
  txnStatus: { fontSize: 10, fontFamily: fonts.mono, textTransform: 'uppercase' },

  // Badge
  badge: { borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2, marginLeft: spacing[1] },
  badgeTxt: { fontSize: 10, fontFamily: fonts.monoMedium },

  // Forms
  pwForm: { padding: spacing[4], gap: spacing[3] },
  input: { backgroundColor: colors.bgMuted, borderRadius: radius.md, paddingHorizontal: spacing[4], paddingVertical: spacing[3], fontSize: fontSize.base, color: colors.textPrimary },
  pwActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelTxt: { color: colors.textMuted, fontSize: fontSize.sm, padding: spacing[2] },
  submitBtn: { backgroundColor: colors.signal, borderRadius: radius.md, paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  submitBtnTxt: { color: '#fff', fontSize: fontSize.sm, fontWeight: '600' },
  disabled: { opacity: 0.4 },

  // Misc
  withdrawRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[4] },
  withdrawInput: { flex: 1, backgroundColor: colors.bgMuted, borderRadius: radius.md, paddingHorizontal: spacing[4], paddingVertical: spacing[3], color: colors.textPrimary, fontSize: fontSize.base },

  pressed: { opacity: 0.7 },
  emptyCard: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing[6], alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] },
  emptyTitle: { color: colors.textSecondary, fontSize: fontSize.base, fontWeight: '500' },
  emptySub: { color: colors.textFaint, fontSize: fontSize.sm, textAlign: 'center', lineHeight: fontSize.sm * 1.6 },
  logoutBtn: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, paddingVertical: spacing[4], alignItems: 'center', marginTop: spacing[4] },
  logoutTxt: { color: colors.error, fontSize: fontSize.base, fontWeight: '600' },
  deleteBtn: { paddingVertical: spacing[4], alignItems: 'center', marginTop: spacing[2], marginBottom: spacing[8] },
  deleteTxt: { color: colors.textFaint, fontSize: fontSize.sm },
});
