import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing, radius, fontSize, fonts } from '@/constants/tokens';

interface BankAccountData {
  account_type: 'indian_bank' | 'foreign_bank';
  account_holder_name: string;
  account_number: string;
  routing_number: string;
  bank_name: string;
  country: string;
  currency: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: BankAccountData) => Promise<void>;
}

export function BankAccountModal({ visible, onClose, onSubmit }: Props) {
  const [type, setType] = useState<'indian_bank' | 'foreign_bank'>('indian_bank');
  const [holder, setHolder] = useState('');
  const [account, setAccount] = useState('');
  const [routing, setRouting] = useState('');
  const [bank, setBank] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [submitting, setSubmitting] = useState(false);

  const isIndian = type === 'indian_bank';
  const canSubmit = holder.trim().length > 0 && account.trim().length > 0 && routing.trim().length > 0 && bank.trim().length > 0;

  const reset = () => { setHolder(''); setAccount(''); setRouting(''); setBank(''); setCurrency('INR'); setType('indian_bank'); };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        account_type: type,
        account_holder_name: holder.trim(),
        account_number: account.trim(),
        routing_number: routing.trim(),
        bank_name: bank.trim(),
        country: isIndian ? 'IN' : 'US',
        currency: isIndian ? 'INR' : currency,
      });
      reset();
      onClose();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => { reset(); onClose(); }}>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.card}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={s.title}>Add Bank Account</Text>
            <Text style={s.subtitle}>Enter your bank details to receive payouts</Text>

            {/* Account type toggle */}
            <View style={s.typeRow}>
              <Pressable style={[s.typeBtn, isIndian && s.typeBtnActive]} onPress={() => { setType('indian_bank'); setCurrency('INR'); }}>
                <Text style={[s.typeTxt, isIndian && s.typeTxtActive]}>Indian Bank</Text>
              </Pressable>
              <Pressable style={[s.typeBtn, !isIndian && s.typeBtnActive]} onPress={() => { setType('foreign_bank'); setCurrency('USD'); }}>
                <Text style={[s.typeTxt, !isIndian && s.typeTxtActive]}>Foreign Bank</Text>
              </Pressable>
            </View>

            <Text style={s.label}>Account Holder Name *</Text>
            <TextInput style={s.input} value={holder} onChangeText={setHolder} placeholder="John Doe" placeholderTextColor={colors.textFaint} autoCapitalize="words" />

            <Text style={s.label}>Account Number *</Text>
            <TextInput style={s.input} value={account} onChangeText={setAccount} placeholder="1234567890" placeholderTextColor={colors.textFaint} keyboardType="number-pad" />

            <Text style={s.label}>{isIndian ? 'IFSC Code *' : 'SWIFT / BIC Code *'}</Text>
            <TextInput style={s.input} value={routing} onChangeText={setRouting} placeholder={isIndian ? 'SBIN0001234' : 'CHASUS33'} placeholderTextColor={colors.textFaint} autoCapitalize="characters" />

            <Text style={s.label}>Bank Name *</Text>
            <TextInput style={s.input} value={bank} onChangeText={setBank} placeholder={isIndian ? 'State Bank of India' : 'Chase Bank'} placeholderTextColor={colors.textFaint} />

            {/* Currency selector for foreign banks */}
            {!isIndian ? (
              <>
                <Text style={s.label}>Currency</Text>
                <View style={s.currRow}>
                  {['USD', 'EUR', 'GBP'].map((c) => (
                    <Pressable key={c} style={[s.currBtn, currency === c && s.currBtnActive]} onPress={() => setCurrency(c)}>
                      <Text style={[s.currTxt, currency === c && s.currTxtActive]}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <View style={s.actions}>
              <Pressable style={s.cancelBtn} onPress={() => { reset(); onClose(); }}>
                <Text style={s.cancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable style={[s.submitBtn, (!canSubmit || submitting) && s.disabled]} onPress={handleSubmit} disabled={!canSubmit || submitting}>
                <Text style={s.submitTxt}>{submitting ? 'Adding...' : 'Add Account'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  card: { backgroundColor: colors.bgSurface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing[5], maxHeight: '90%' },
  title: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing[1] },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing[4] },

  typeRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  typeBtn: { flex: 1, paddingVertical: spacing[3], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  typeBtnActive: { backgroundColor: colors.signal, borderColor: colors.signal },
  typeTxt: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500' },
  typeTxtActive: { color: '#fff' },

  label: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing[1], marginTop: spacing[3] },
  input: { backgroundColor: colors.bgMuted, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing[4], paddingVertical: spacing[3], color: colors.textPrimary, fontSize: fontSize.base },

  currRow: { flexDirection: 'row', gap: spacing[2] },
  currBtn: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  currBtnActive: { backgroundColor: colors.signal, borderColor: colors.signal },
  currTxt: { color: colors.textSecondary, fontSize: fontSize.sm, fontFamily: fonts.mono },
  currTxtActive: { color: '#fff' },

  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing[6] },
  cancelBtn: { paddingVertical: spacing[3], paddingHorizontal: spacing[4] },
  cancelTxt: { color: colors.textMuted, fontSize: fontSize.base },
  submitBtn: { backgroundColor: colors.signal, borderRadius: radius.md, paddingVertical: spacing[3], paddingHorizontal: spacing[6] },
  disabled: { opacity: 0.4 },
  submitTxt: { color: '#fff', fontSize: fontSize.base, fontWeight: '600' },
});
