import { useState, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, radius, fontSize, fonts } from '@/constants/tokens';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  defaultValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}

export function PromptModal({ visible, title, message, defaultValue = '', onSubmit, onCancel, placeholder, secureTextEntry }: Props) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (visible) setValue(defaultValue);
  }, [visible, defaultValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          {message ? <Text style={s.message}>{message}</Text> : null}
          <TextInput
            style={s.input}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder ?? title}
            placeholderTextColor={colors.textFaint}
            autoFocus
            secureTextEntry={secureTextEntry}
            onSubmitEditing={() => { if (value.trim()) onSubmit(value.trim()); }}
          />
          <View style={s.actions}>
            <Pressable style={s.cancelBtn} onPress={onCancel}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </Pressable>
            <Pressable style={[s.okBtn, !value.trim() && s.disabled]} onPress={() => { if (value.trim()) onSubmit(value.trim()); }} disabled={!value.trim()}>
              <Text style={s.okTxt}>OK</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: colors.bgSurface, borderRadius: radius.xl, borderCurve: 'continuous', width: '85%', padding: spacing[5], gap: spacing[3] },
  title: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '600' },
  message: { color: colors.textSecondary, fontSize: fontSize.sm },
  input: { backgroundColor: colors.bgMuted, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing[4], paddingVertical: spacing[3], color: colors.textPrimary, fontSize: fontSize.base },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing[3] },
  cancelBtn: { paddingVertical: spacing[2], paddingHorizontal: spacing[3] },
  cancelTxt: { color: colors.textMuted, fontSize: fontSize.base },
  okBtn: { backgroundColor: colors.signal, borderRadius: radius.md, paddingVertical: spacing[2], paddingHorizontal: spacing[5] },
  disabled: { opacity: 0.4 },
  okTxt: { color: '#fff', fontSize: fontSize.base, fontWeight: '600' },
});
