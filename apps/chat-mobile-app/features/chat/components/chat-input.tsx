import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Provider } from '@raweval/types';

import { colors, fonts, fontSize, radius, spacing } from '@/constants/tokens';
import { useChatStore } from '@/stores/chat-store';
import { useModels } from '@/features/chat/api/get-models';

interface FileAttachment { uri: string; name: string; type: string }

interface ChatInputProps {
  onSend: (content: string, images?: string[], files?: FileAttachment[]) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStopGenerating?: () => void;
}

interface ModelItem {
  provider: Provider;
  model: string;
  name: string;
  description?: string;
  search?: boolean;
  vision?: boolean;
  tools?: boolean;
}

const FALLBACK_MODELS: ModelItem[] = [
  { provider: 'openai', model: 'gpt-4.1', name: 'GPT-4.1', description: 'Latest flagship — 1M context', search: true, vision: true, tools: true },
  { provider: 'openai', model: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Fast and smart — great value', search: true, vision: true, tools: true },
  { provider: 'openai', model: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal — vision, tools, search', search: true, vision: true, tools: true },
  { provider: 'openai', model: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast, affordable — everyday tasks', search: true, vision: true, tools: true },
  { provider: 'openai', model: 'o3', name: 'o3', description: 'Top-tier reasoning with vision', search: true, vision: true, tools: true },
  { provider: 'openai', model: 'o3-mini', name: 'o3 Mini', description: 'Fast reasoning with search', search: true, tools: true },
  { provider: 'openai', model: 'o1', name: 'o1', description: 'Deep reasoning — math & science', search: true, vision: true, tools: true },
  { provider: 'claude', model: 'anthropic/claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most powerful Claude', search: true, vision: true, tools: true },
  { provider: 'claude', model: 'anthropic/claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Best for coding & analysis', search: true, vision: true, tools: true },
  { provider: 'claude', model: 'anthropic/claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Strong all-rounder with vision', search: true, vision: true, tools: true },
  { provider: 'claude', model: 'anthropic/claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast Anthropic model', search: true, vision: true, tools: true },
  { provider: 'gemini', model: 'gemini/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Premium Google model', search: true, vision: true, tools: true },
  { provider: 'gemini', model: 'gemini/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast reasoning — 1M context', search: true, vision: true, tools: true },
  { provider: 'gemini', model: 'gemini/gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast and capable', search: true, vision: true, tools: true },
  { provider: 'deepseek', model: 'deepseek/deepseek-chat', name: 'DeepSeek V3', description: 'Ultra cheap open model', search: true, vision: true, tools: true },
  { provider: 'deepseek', model: 'deepseek/deepseek-reasoner', name: 'DeepSeek R1', description: 'Open reasoning model', search: true },
];

function parseModelItem(m: Record<string, unknown>): ModelItem {
  const caps = (m.capabilities ?? {}) as Record<string, unknown>;
  return {
    provider: String(m.provider ?? 'unknown') as Provider,
    model: String(m.model_id ?? m.model ?? ''),
    name: String(m.display_name ?? m.label ?? m.model ?? 'Unknown'),
    description: (m.description as string) ?? undefined,
    search: Boolean(caps.supports_web_search ?? m.supports_web_search),
    vision: Boolean(caps.supports_vision ?? m.supports_vision),
    tools: Boolean(caps.supports_tools ?? m.supports_tools),
  };
}

function parseModelsResponse(data: unknown): ModelItem[] | null {
  if (!data || typeof data !== 'object') return null;
  const filterActive = (items: Record<string, unknown>[]) =>
    items.filter((m) => !m.is_deprecated).map(parseModelItem);
  if (Array.isArray(data) && data.length > 0) return filterActive(data as Record<string, unknown>[]);
  const resp = data as Record<string, unknown>;
  const arr = resp.models as Record<string, unknown>[] | undefined;
  if (Array.isArray(arr) && arr.length > 0) return filterActive(arr);
  const byProvider = resp.models_by_provider as Record<string, string[]> | undefined;
  if (byProvider && typeof byProvider === 'object') {
    const result: ModelItem[] = [];
    for (const [prov, ids] of Object.entries(byProvider)) {
      if (Array.isArray(ids)) ids.forEach((id) => result.push({ provider: prov as Provider, model: id, name: id.split('/').pop() ?? id }));
    }
    if (result.length > 0) return result;
  }
  return null;
}

const MAX_CHARS = 10_000;

function providerLabel(p: string): string {
  return { openai: 'OpenAI', claude: 'Anthropic', gemini: 'Google', deepseek: 'DeepSeek', groq: 'Groq', grok: 'xAI' }[p] ?? p;
}

export function ChatInput({ onSend, disabled = false, isStreaming = false, onStopGenerating }: ChatInputProps) {
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [modelSearch, setModelSearch] = useState('');

  const selectedModel = useChatStore((s) => s.selectedModel);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);
  const compareMode = useChatStore((s) => s.compareMode);
  const setCompareMode = useChatStore((s) => s.setCompareMode);
  const selectedModels = useChatStore((s) => s.selectedModels);
  const toggleModelInComparison = useChatStore((s) => s.toggleModelInComparison);
  const webSearchEnabled = useChatStore((s) => s.webSearchEnabled);
  const setWebSearchEnabled = useChatStore((s) => s.setWebSearchEnabled);

  const { data: modelsData } = useModels();

  const models: ModelItem[] = useMemo(() => {
    return parseModelsResponse(modelsData) ?? FALLBACK_MODELS;
  }, [modelsData]);

  const currentModelName = useMemo(() => {
    const found = models.find((m) => m.model === selectedModel.model && m.provider === selectedModel.provider);
    return found?.name ?? 'GPT-4o';
  }, [models, selectedModel]);

  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return models;
    const q = modelSearch.toLowerCase();
    return models.filter((m) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || (m.description ?? '').toLowerCase().includes(q));
  }, [models, modelSearch]);

  // Group by provider for sectioned display
  const groupedModels = useMemo(() => {
    const groups: Record<string, ModelItem[]> = {};
    for (const m of filteredModels) {
      const key = m.provider;
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(m);
    }
    return Object.entries(groups).map(([provider, items]) => ({ provider, items }));
  }, [filteredModels]);

  const canSend = !disabled && !isStreaming && (text.trim().length > 0 || images.length > 0 || files.length > 0);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSend(text.trim(), images.length > 0 ? images : undefined, files.length > 0 ? files : undefined);
    setText('');
    setImages([]);
    setFiles([]);
  }, [canSend, text, images, files, onSend]);

  const handleAttach = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Add Attachment', undefined, [
      { text: 'Camera', onPress: async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed'); return; }
        const r = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (!r.canceled && r.assets[0]) setImages((p) => [...p, r.assets[0]!.uri]);
      }},
      { text: 'Photos', onPress: async () => {
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
        if (!r.canceled) setImages((p) => [...p, ...r.assets.map((a) => a.uri)]);
      }},
      { text: 'Document', onPress: async () => {
        const r = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
        if (!r.canceled) setFiles((p) => [...p, ...r.assets.map((a) => ({ uri: a.uri, name: a.name, type: a.mimeType ?? 'application/octet-stream' }))]);
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  return (
    <>
      <View style={[s.root, { paddingBottom: Math.max(insets.bottom, spacing[1]) }]}>
        {/* Attachments */}
        {(images.length > 0 || files.length > 0) ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.attachRow}>
            {images.map((uri, i) => (
              <View key={`img-${i}`} style={s.thumb}>
                <Image source={{ uri }} style={s.thumbImg} />
                <Pressable style={s.removeBtn} onPress={() => setImages((p) => p.filter((_, idx) => idx !== i))} hitSlop={8}>
                  <Text style={s.removeTxt}>×</Text>
                </Pressable>
              </View>
            ))}
            {files.map((f, i) => (
              <View key={`f-${i}`} style={s.fileChip}>
                <Text style={s.fileTxt} numberOfLines={1}>{f.name}</Text>
                <Pressable style={s.removeBtn} onPress={() => setFiles((p) => p.filter((_, idx) => idx !== i))} hitSlop={8}>
                  <Text style={s.removeTxt}>×</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}

        {/* Model selector bar — ChatGPT style: small pill above input */}
        <View style={s.modelBar}>
          <Pressable style={({ pressed }) => [s.modelPill, pressed && s.pillPressed]} onPress={() => setModelModalVisible(true)}>
            <Text style={s.modelPillTxt}>{compareMode ? `${selectedModels.length} models` : currentModelName}</Text>
            <Text style={s.modelPillArrow}>▾</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.togglePill, webSearchEnabled && s.togglePillActive, pressed && s.pillPressed]}
            onPress={() => setWebSearchEnabled(!webSearchEnabled)}
          >
            <Text style={[s.togglePillTxt, webSearchEnabled && s.togglePillTxtActive]}>Web</Text>
          </Pressable>
        </View>

        {/* Input container — unified rounded box like ChatGPT */}
        <View style={s.inputContainer}>
          <Pressable style={s.attachBtn} onPress={handleAttach} hitSlop={4}>
            <Text style={s.attachIcon}>+</Text>
          </Pressable>

          <TextInput
            ref={inputRef}
            style={s.input}
            value={text}
            onChangeText={(v) => { if (v.length <= MAX_CHARS) setText(v); }}
            placeholder="Message..."
            placeholderTextColor={colors.textMuted}
            multiline
            editable={!disabled}
            returnKeyType={Platform.OS === 'ios' ? 'default' : 'send'}
            {...(Platform.OS === 'android' ? { onSubmitEditing: handleSend } : {})}
          />

          {isStreaming ? (
            <Pressable style={s.stopBtn} onPress={onStopGenerating}>
              <View style={s.stopSquare} />
            </Pressable>
          ) : (
            <Pressable
              style={[s.sendBtn, canSend && s.sendBtnActive]}
              onPress={handleSend}
              disabled={!canSend}
            >
              <Text style={[s.sendArrow, canSend && s.sendArrowActive]}>↑</Text>
            </Pressable>
          )}
        </View>

        {text.length > 9000 ? (
          <Text style={s.charCount}>{text.length.toLocaleString()} / 10,000</Text>
        ) : null}
      </View>

      {/* Model Toolbox */}
      <Modal visible={modelModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModelModalVisible(false)}>
        <View style={[s.modal, { paddingTop: insets.top || spacing[4] }]}>
          {/* Header */}
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Model Toolbox</Text>
            <View style={s.modalHeaderRight}>
              <Pressable
                style={({ pressed }) => [s.comparePill, compareMode && s.comparePillActive, pressed && s.pillPressed]}
                onPress={() => setCompareMode(!compareMode)}
              >
                <Text style={[s.comparePillTxt, compareMode && s.comparePillTxtActive]}>
                  {compareMode ? `Compare · ${selectedModels.length}/4` : 'Compare'}
                </Text>
              </Pressable>
              <Pressable onPress={() => { setModelModalVisible(false); setModelSearch(''); }} hitSlop={8}>
                <Text style={s.modalCloseTxt}>✕</Text>
              </Pressable>
            </View>
          </View>

          {/* Search */}
          <TextInput
            style={s.modalSearch}
            value={modelSearch}
            onChangeText={setModelSearch}
            placeholder="Search models..."
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
          />

          {/* Model cards grouped by provider */}
          <ScrollView contentContainerStyle={s.modalList} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {groupedModels.map(({ provider, items }) => (
              <View key={provider} style={s.mGroup}>
                <Text style={s.mGroupLabel}>{providerLabel(provider).toUpperCase()}</Text>
                <View style={s.mGrid}>
                  {items.map((item) => {
                    const sel = compareMode
                      ? selectedModels.some((m) => m.provider === item.provider && m.model === item.model)
                      : item.model === selectedModel.model && item.provider === selectedModel.provider;
                    return (
                      <Pressable
                        key={`${item.provider}:${item.model}`}
                        style={({ pressed }) => [s.mCard, sel && s.mCardSel, pressed && s.mCardPressed]}
                        onPress={() => {
                          if (compareMode) {
                            toggleModelInComparison({ provider: item.provider, model: item.model });
                          } else {
                            setSelectedModel({ provider: item.provider, model: item.model });
                            setModelModalVisible(false);
                            setModelSearch('');
                          }
                        }}
                      >
                        {sel ? <View style={s.mSelDot} /> : null}
                        <Text style={s.mCardName}>{item.name}</Text>
                        {item.description ? <Text style={s.mCardDesc} numberOfLines={2}>{item.description}</Text> : null}
                        <View style={s.mBadges}>
                          {item.search ? <View style={s.mBadge}><Text style={s.mBadgeTxt}>Search</Text></View> : null}
                          {item.vision ? <View style={s.mBadge}><Text style={s.mBadgeTxt}>Vision</Text></View> : null}
                          {item.tools ? <View style={s.mBadge}><Text style={s.mBadgeTxt}>Tools</Text></View> : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
            <Text style={s.mCount}>{models.length} models available</Text>
          </ScrollView>

          {/* Footer */}
          <View style={s.modalFooter}>
            <Pressable style={s.modalDoneBtn} onPress={() => { setModelModalVisible(false); setModelSearch(''); }}>
              <Text style={s.modalDoneBtnTxt}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  root: {
    backgroundColor: colors.bgBase,
    paddingTop: spacing[1],
  },

  // Attachments
  attachRow: { paddingHorizontal: spacing[4], paddingBottom: spacing[2], gap: spacing[2], flexDirection: 'row' },
  thumb: { width: 48, height: 48, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.bgMuted },
  thumbImg: { width: 48, height: 48 },
  fileChip: { height: 48, paddingHorizontal: spacing[3], backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', maxWidth: 140 },
  fileTxt: { fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono },
  removeBtn: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border },
  removeTxt: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', lineHeight: 15 },

  // Model bar
  modelBar: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: spacing[4], paddingBottom: spacing[2] },
  modelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    height: 32,
  },
  pillPressed: { opacity: 0.7 },
  modelPillTxt: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.mono },
  modelPillArrow: { color: colors.textMuted, fontSize: 10 },
  togglePill: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    height: 32,
    justifyContent: 'center',
  },
  togglePillActive: { backgroundColor: colors.signalSubtle, borderColor: colors.signalBorder },
  togglePillTxt: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.mono },
  togglePillTxtActive: { color: colors.signal },

  // Input container — unified ChatGPT-style rounded box
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    marginHorizontal: spacing[3],
    marginBottom: spacing[1],
    paddingLeft: spacing[1],
    paddingRight: spacing[1],
    paddingVertical: spacing[1],
    minHeight: 48,
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  attachIcon: { color: colors.textSecondary, fontSize: 22, fontWeight: '300', marginTop: -1 },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.base,
    paddingHorizontal: spacing[3],
    paddingTop: Platform.OS === 'ios' ? 9 : 8,
    paddingBottom: Platform.OS === 'ios' ? 9 : 8,
    maxHeight: 120,
    minHeight: 36,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: colors.textPrimary },
  sendArrow: { color: colors.textMuted, fontSize: 18, fontWeight: '800', marginTop: -1 },
  sendArrowActive: { color: colors.bgBase },
  stopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopSquare: { width: 12, height: 12, borderRadius: 2, backgroundColor: colors.bgBase },

  charCount: { textAlign: 'center', fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint, paddingBottom: spacing[1] },

  // Compare
  comparePill: { backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1], height: 32, justifyContent: 'center' },
  comparePillActive: { backgroundColor: colors.signalSubtle, borderColor: colors.signalBorder },
  comparePillTxt: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.mono },
  comparePillTxtActive: { color: colors.signal },

  // Modal
  modal: { flex: 1, backgroundColor: colors.bgBase },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingBottom: spacing[3] },
  modalHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  modalCloseTxt: { color: colors.textMuted, fontSize: 20 },
  modalSearch: { backgroundColor: colors.bgSurface, color: colors.textPrimary, fontSize: fontSize.base, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing[4], paddingVertical: spacing[3], marginHorizontal: spacing[4], marginBottom: spacing[3], minHeight: 44 },
  modalList: { paddingHorizontal: spacing[4], paddingBottom: spacing[12] },
  modalFooter: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, padding: spacing[4], alignItems: 'flex-end' },
  modalDoneBtn: { backgroundColor: colors.signal, borderRadius: radius.md, paddingHorizontal: spacing[6], paddingVertical: spacing[3] },
  modalDoneBtnTxt: { color: '#fff', fontSize: fontSize.base, fontWeight: '600' },

  // Model groups
  mGroup: { marginBottom: spacing[5] },
  mGroupLabel: { color: colors.textFaint, fontSize: 11, fontFamily: fonts.monoMedium, letterSpacing: 1.5, marginBottom: spacing[3] },
  mGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },

  // Model cards
  mCard: {
    width: '48.5%',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    padding: spacing[3],
    gap: spacing[2],
    minHeight: 100,
  },
  mCardSel: { borderColor: colors.signal, borderWidth: 2, backgroundColor: colors.signalSubtle },
  mCardPressed: { backgroundColor: colors.bgMuted },
  mSelDot: { position: 'absolute', top: spacing[2], right: spacing[2], width: 10, height: 10, borderRadius: 5, backgroundColor: colors.signal },
  mCardName: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '600' },
  mCardDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: fontSize.xs * 1.4 },
  mBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1], marginTop: 'auto' as unknown as number },
  mBadge: { backgroundColor: colors.bgMuted, borderRadius: radius.sm, paddingHorizontal: spacing[2], paddingVertical: 2 },
  mBadgeTxt: { color: colors.success, fontSize: 9, fontFamily: fonts.mono, fontWeight: '600' },
  mCount: { color: colors.textFaint, fontSize: fontSize.xs, fontFamily: fonts.mono, textAlign: 'center', paddingVertical: spacing[4] },
});
