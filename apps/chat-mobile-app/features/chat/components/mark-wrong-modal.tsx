import { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, radius, fontSize, fonts } from '@/constants/tokens';

interface MarkWrongModalProps {
  visible: boolean;
  onClose: () => void;
  messageContent: string;
  onSubmit: (request: {
    domain?: string;
    reason?: string;
    description?: string;
  }) => Promise<void>;
}

export function MarkWrongModal({ visible, onClose, messageContent, onSubmit }: MarkWrongModalProps) {
  const [domain, setDomain] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const preview = messageContent.length > 200 ? messageContent.slice(0, 200) + '...' : messageContent;

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      await onSubmit({
        domain: domain || undefined,
        reason: reason || undefined,
        description: description || undefined,
      });
      setDomain('');
      setReason('');
      setDescription('');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [domain, reason, description, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    setDomain('');
    setReason('');
    setDescription('');
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Report Incorrect Response</Text>
              <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={8}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            {/* Preview */}
            <View style={styles.preview}>
              <Text style={styles.previewText}>{preview}</Text>
            </View>

            {/* Fields */}
            <Text style={styles.label}>Domain (optional)</Text>
            <TextInput style={styles.input} value={domain} onChangeText={setDomain} placeholder="e.g. science, technology" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>What's wrong?</Text>
            <TextInput style={styles.input} value={reason} onChangeText={setReason} placeholder="Brief reason" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>Details (optional)</Text>
            <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="More context..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" />

            {/* Actions */}
            <Pressable style={({ pressed }) => [styles.submitBtn, pressed && styles.submitPressed]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.textInverse} size="small" /> : <Text style={styles.submitTxt}>Submit Report</Text>}
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </Pressable>

            <Text style={styles.footer}>Our QC team will review this report</Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: colors.bgSurface, borderRadius: radius.xl, borderCurve: 'continuous', maxHeight: '80%', width: '90%', padding: spacing[5] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] },
  title: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600', flex: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bgMuted, justifyContent: 'center', alignItems: 'center' },
  closeIcon: { color: colors.textSecondary, fontSize: fontSize.base },
  preview: { backgroundColor: colors.bgMuted, borderRadius: radius.md, padding: spacing[3], marginBottom: spacing[4] },
  previewText: { color: colors.textSecondary, fontSize: fontSize.sm, fontFamily: fonts.mono, lineHeight: fontSize.sm * 1.5 },
  label: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500', marginBottom: spacing[1] },
  input: { backgroundColor: colors.bgMuted, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing[3], color: colors.textPrimary, fontSize: fontSize.base, marginBottom: spacing[3] },
  textarea: { minHeight: 80 },
  submitBtn: { backgroundColor: colors.signal, borderRadius: radius.md, borderCurve: 'continuous', paddingVertical: spacing[3], alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: spacing[2] },
  submitPressed: { opacity: 0.8 },
  submitTxt: { color: colors.textInverse, fontSize: fontSize.base, fontWeight: '600' },
  cancelBtn: { paddingVertical: spacing[3], alignItems: 'center' },
  cancelTxt: { color: colors.textSecondary, fontSize: fontSize.base },
  footer: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing[2] },
});
