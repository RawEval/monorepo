import { memo, useCallback, useState } from 'react';
import { Dimensions, Image, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

import { colors, fonts, fontSize, lineHeight, radius, spacing } from '@/constants/tokens';
import type { ChatMessage } from '@/features/chat/types';

const aiAvatar = require('@/assets/images/icon.png');

/** Convert raw model IDs to friendly display names */
function displayModelName(modelId?: string): string | undefined {
  if (!modelId) return undefined;
  const map: Record<string, string> = {
    'gpt-4.1': 'GPT-4.1',
    'gpt-4.1-mini': 'GPT-4.1 Mini',
    'gpt-4.1-nano': 'GPT-4.1 Nano',
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'o4-mini': 'o4 Mini',
    'o3': 'o3',
    'o3-mini': 'o3 Mini',
    'o1': 'o1',
    'anthropic/claude-opus-4-20250514': 'Claude Opus 4',
    'anthropic/claude-sonnet-4-20250514': 'Claude Sonnet 4',
    'anthropic/claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'anthropic/claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
    'gemini/gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini/gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini/gemini-2.0-flash': 'Gemini 2.0 Flash',
    'gemini/gemini-1.5-pro': 'Gemini 1.5 Pro',
    'deepseek/deepseek-chat': 'DeepSeek V3',
    'deepseek/deepseek-reasoner': 'DeepSeek R1',
    'mistral-large-latest': 'Mistral Large',
    'mistral-small-latest': 'Mistral Small',
    'codestral-latest': 'Codestral',
  };
  // Exact match
  if (map[modelId]) return map[modelId];
  // Try without provider prefix
  for (const [key, name] of Object.entries(map)) {
    if (modelId.endsWith(key) || key.endsWith(modelId)) return name;
  }
  // Fallback: clean up the ID
  const clean = modelId.split('/').pop() ?? modelId;
  return clean.replace(/-\d{8,}$/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ChatMessageProps {
  message: ChatMessage;
  onMarkWrong?: (messageId: string) => void;
  isMarkingWrong?: boolean;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
}

// ChatGPT/Claude style markdown — clean, readable
// NOTE: Do NOT set fontFamily on body — system font has emoji support
const mdStyles = StyleSheet.create({
  body: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.relaxed,
    fontFamily: undefined, // use system default for emoji support
  },
  paragraph: {
    marginTop: 0,
    marginBottom: spacing[3],
  },
  heading1: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing[4],
    marginBottom: spacing[2],
    lineHeight: fontSize.xl * 1.3,
  },
  heading2: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing[4],
    marginBottom: spacing[2],
    lineHeight: fontSize.lg * 1.3,
  },
  heading3: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginTop: spacing[3],
    marginBottom: spacing[1],
    lineHeight: fontSize.md * 1.3,
  },
  strong: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: colors.signal,
    textDecorationLine: 'none',
  },
  // Code
  code_inline: {
    backgroundColor: colors.bgMuted,
    color: colors.signal,
    fontFamily: fonts.mono,
    fontSize: fontSize.sm - 1,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.md,
    padding: spacing[3],
    fontFamily: fonts.mono,
    fontSize: fontSize.sm - 1,
    color: colors.textSecondary,
    marginVertical: spacing[2],
    overflow: 'hidden',
  },
  code_block: {
    backgroundColor: colors.bgMuted,
    borderRadius: radius.md,
    padding: spacing[3],
    fontFamily: fonts.mono,
    fontSize: fontSize.sm - 1,
    color: colors.textSecondary,
  },
  // Lists
  bullet_list: {
    marginVertical: spacing[1],
  },
  ordered_list: {
    marginVertical: spacing[1],
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: spacing[1],
  },
  bullet_list_icon: {
    color: colors.textMuted,
    marginRight: spacing[2],
    fontSize: fontSize.sm,
    lineHeight: fontSize.base * lineHeight.relaxed,
  },
  ordered_list_icon: {
    color: colors.textMuted,
    marginRight: spacing[2],
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    lineHeight: fontSize.base * lineHeight.relaxed,
  },
  // Blockquote
  blockquote: {
    backgroundColor: 'transparent',
    borderLeftWidth: 3,
    borderLeftColor: colors.signal,
    paddingLeft: spacing[3],
    marginVertical: spacing[2],
  },
  // Table
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    marginVertical: spacing[2],
  },
  th: {
    backgroundColor: colors.bgMuted,
    padding: spacing[2],
    borderColor: colors.border,
  },
  td: {
    padding: spacing[2],
    borderColor: colors.border,
  },
  tr: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  // HR
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing[3],
  },
  // Image
  image: {
    borderRadius: radius.md,
    marginVertical: spacing[2],
  },
});

function ChatMessageComponent({ message, onMarkWrong, isMarkingWrong }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(message.content);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const handleMarkWrong = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMarkWrong?.(message.id);
  }, [message.id, onMarkWrong]);

  const handleLink = useCallback((url: string) => {
    Linking.openURL(url);
    return false; // prevent default
  }, []);

  const imageViewer = viewerUri ? (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => setViewerUri(null)}>
      <View style={styles.viewerBg}>
        <SafeAreaView style={styles.viewerSafe} edges={['top', 'bottom']}>
          {/* Close button — safe area aware */}
          <View style={styles.viewerHeader}>
            <Pressable style={styles.viewerClose} onPress={() => setViewerUri(null)} hitSlop={12}>
              <Text style={styles.viewerCloseTxt}>✕</Text>
            </Pressable>
          </View>

          {/* Image — tap background to dismiss */}
          <Pressable style={styles.viewerBody} onPress={() => setViewerUri(null)}>
            <Pressable onPress={() => {/* prevent dismiss when tapping image */}}>
              <Image source={{ uri: viewerUri }} style={styles.viewerImg} resizeMode="contain" />
            </Pressable>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  ) : null;

  // --- USER MESSAGE ---
  if (isUser) {
    const hasImages = message.images && message.images.length > 0;
    const hasText = message.content.trim().length > 0;
    return (
      <>
        <View style={styles.userRow}>
          {hasImages ? (
            <View style={styles.imageGrid}>
              {message.images!.map((uri, i) => (
                <Pressable key={i} onPress={() => setViewerUri(uri)}>
                  <Image source={{ uri }} style={styles.userImage} resizeMode="cover" />
                </Pressable>
              ))}
            </View>
          ) : null}
          {hasText ? (
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{message.content}</Text>
            </View>
          ) : null}
        </View>
        {imageViewer}
      </>
    );
  }

  // --- ASSISTANT MESSAGE ---
  return (
    <>
    <View style={[styles.aiRow, message.isFailed && styles.aiFailed]}>
      {/* Avatar + Content */}
      <View style={styles.aiHeader}>
        <Image source={aiAvatar} style={styles.aiAvatar} />
        <Text style={styles.aiLabel}>RawEval</Text>
      </View>
      {message.content ? (
        <View style={styles.aiContent}>
          <Markdown
            style={mdStyles}
            onLinkPress={handleLink}
          >
            {message.content}
          </Markdown>
        </View>
      ) : null}

      {/* Streaming */}
      {message.isStreaming && !message.content ? (
        <View style={styles.thinkingRow}>
          <View style={styles.thinkingDot} />
          <View style={[styles.thinkingDot, styles.thinkingDot2]} />
          <View style={[styles.thinkingDot, styles.thinkingDot3]} />
        </View>
      ) : null}

      {/* Failed badge */}
      {message.isFailed ? (
        <View style={styles.failedBadge}>
          <Text style={styles.failedText}>Flagged for review</Text>
        </View>
      ) : null}

      {/* Footer: model + time + actions */}
      <View style={styles.aiFooter}>
        <View style={styles.aiMeta}>
          {message.model ? <Text style={styles.metaTxt}>{displayModelName(message.model)}</Text> : null}
          <Text style={styles.metaTxt}>{formatTime(message.createdAt)}</Text>
        </View>

        {!message.isStreaming && !message.isFailed ? (
          <View style={styles.aiActions}>
            <Pressable onPress={handleCopy} hitSlop={8} accessibilityLabel="Copy">
              <Text style={styles.actionTxt}>{copied ? 'Copied!' : 'Copy'}</Text>
            </Pressable>
            {onMarkWrong ? (
              <Pressable onPress={handleMarkWrong} hitSlop={8} disabled={isMarkingWrong} accessibilityLabel="Flag">
                <Text style={[styles.actionTxt, styles.flagTxt]}>{isMarkingWrong ? '...' : 'Flag'}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
    {imageViewer}
    </>
  );
}

export const ChatMessageBubble = memo(ChatMessageComponent);
export default ChatMessageBubble;

const styles = StyleSheet.create({
  // --- User ---
  userRow: {
    alignItems: 'flex-end',
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: colors.signal,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: spacing[5],
    borderBottomRightRadius: spacing[1],
    borderCurve: 'continuous',
  },
  userText: {
    color: '#FFFFFF',
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.relaxed,
  },
  userImage: {
    width: 200,
    height: 200,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    marginTop: spacing[2],
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[2],
    justifyContent: 'flex-end',
  },

  // --- AI ---
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  aiAvatar: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderCurve: 'continuous',
  },
  aiLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  aiRow: {
    paddingBottom: spacing[2],
  },
  aiFailed: {
    borderLeftWidth: 3,
    borderLeftColor: colors.signal,
    paddingLeft: spacing[3],
  },
  aiContent: {
    // Full width, no bubble — like ChatGPT/Claude
  },

  thinkingRow: {
    flexDirection: 'row',
    gap: spacing[1],
    paddingVertical: spacing[2],
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.4,
  },
  thinkingDot2: { opacity: 0.6 },
  thinkingDot3: { opacity: 0.8 },

  failedBadge: {
    backgroundColor: colors.signalSubtle,
    borderWidth: 1,
    borderColor: colors.signalBorder,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: spacing[2],
  },
  failedText: {
    color: colors.signal,
    fontFamily: fonts.mono,
    fontSize: 11,
  },

  aiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[1],
    paddingTop: spacing[1],
  },
  aiMeta: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'center',
  },
  metaTxt: {
    color: colors.textFaint,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  aiActions: {
    flexDirection: 'row',
    gap: spacing[4],
    alignItems: 'center',
  },
  actionTxt: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  flagTxt: {
    color: colors.signal,
  },

  // Image viewer
  viewerBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  viewerSafe: { flex: 1 },
  viewerHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  viewerClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  viewerCloseTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  viewerBody: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  viewerImg: { width: SCREEN_W, height: SCREEN_H * 0.75 },
});
