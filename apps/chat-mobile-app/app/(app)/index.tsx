import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, radius, fontSize, fonts } from '@/constants/tokens';
import { ChatHeader } from '@/components/layout/chat-header';
import { useChat } from '@/features/chat/hooks/use-chat';
import { useChatStore } from '@/stores/chat-store';
import { useProjectsStore } from '@/stores/projects-store';
import { ChatMessageBubble } from '@/features/chat/components/chat-message';
import { ChatInput } from '@/features/chat/components/chat-input';
import { EmptyState } from '@/features/chat/components/empty-state';
import { ChatSkeleton } from '@/features/chat/components/chat-skeleton';
import { MarkWrongModal } from '@/features/chat/components/mark-wrong-modal';
import type { ChatMessage } from '@/features/chat/types';

type DisplayItem =
  | { type: 'message'; message: ChatMessage; key: string }
  | { type: 'group'; messages: ChatMessage[]; groupId: string; key: string };

function groupMessages(msgs: ChatMessage[]): DisplayItem[] {
  const result: DisplayItem[] = [];
  const groupMap = new Map<string, ChatMessage[]>();
  const seen = new Set<string>();
  for (const m of msgs) {
    if (m.groupId) {
      if (!groupMap.has(m.groupId)) groupMap.set(m.groupId, []);
      groupMap.get(m.groupId)!.push(m);
    }
  }
  for (const m of msgs) {
    if (m.groupId) {
      if (seen.has(m.groupId)) continue;
      seen.add(m.groupId);
      result.push({ type: 'group', messages: groupMap.get(m.groupId)!, groupId: m.groupId, key: m.groupId });
    } else {
      result.push({ type: 'message', message: m, key: m.id });
    }
  }
  return result;
}

function CompareCard({ message, onMarkWrong, isMarkingWrong }: { message: ChatMessage; onMarkWrong?: (id: string) => void; isMarkingWrong?: boolean }) {
  const modelName = message.model?.split('/').pop() ?? 'Model';
  return (
    <View style={cmp.card}>
      <View style={cmp.cardHeader}>
        <Text style={cmp.modelName}>{modelName}</Text>
        {message.isStreaming ? <Text style={cmp.streaming}>streaming...</Text> : null}
      </View>
      <ScrollView style={cmp.cardBody} nestedScrollEnabled>
        {message.content ? <Text style={cmp.content}>{message.content}</Text> : message.isStreaming ? <Text style={cmp.dots}>...</Text> : null}
        {message.modelError ? <Text style={cmp.error}>{message.modelError}</Text> : null}
      </ScrollView>
      {!message.isStreaming ? (
        <View style={cmp.cardFooter}>
          {message.isFailed ? <Text style={cmp.flagged}>Flagged</Text> : onMarkWrong ? (
            <Pressable onPress={() => onMarkWrong(message.id)} disabled={isMarkingWrong}>
              <Text style={cmp.flagBtn}>{isMarkingWrong ? '...' : 'Flag'}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<DisplayItem>>(null);
  const [markWrongVisible, setMarkWrongVisible] = useState(false);
  const [markWrongMsg, setMarkWrongMsg] = useState<ChatMessage | null>(null);
  const [nearBottom, setNearBottom] = useState(true);

  const { messages, sendMessage, markAsWrong, error, isSessionLoading, markingWrong, upgradeRequired } = useChat();
  const isStreaming = messages.some((m) => m.isStreaming);
  const projectId = useProjectsStore((s) => s.selectedProjectId) ?? 'p1';
  const displayItems = useMemo(() => groupMessages(messages), [messages]);

  const handleSend = useCallback((content: string, images?: string[]) => {
    sendMessage(content, images);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
  }, [sendMessage]);

  const handleSuggestion = useCallback((prompt: string) => {
    sendMessage(prompt);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
  }, [sendMessage]);

  const handleMarkWrong = useCallback((messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (msg) { setMarkWrongMsg(msg); setMarkWrongVisible(true); }
  }, [messages]);

  const handleMarkWrongSubmit = useCallback(async (req: { domain?: string; reason?: string; description?: string }) => {
    if (!markWrongMsg) return;
    await markAsWrong(markWrongMsg.id, req);
    setMarkWrongVisible(false);
    setMarkWrongMsg(null);
  }, [markAsWrong, markWrongMsg]);

  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    setNearBottom(contentSize.height - contentOffset.y - layoutMeasurement.height < 150);
  }, []);

  const renderItem = useCallback(({ item }: { item: DisplayItem }) => {
    if (item.type === 'group') {
      return (
        <View style={cmp.groupContainer}>
          <Text style={cmp.groupLabel}>Comparing {item.messages.length} models</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cmp.groupScroll}>
            {item.messages.map((m) => (
              <CompareCard key={m.id} message={m} onMarkWrong={handleMarkWrong} isMarkingWrong={markingWrong.has(m.id)} />
            ))}
          </ScrollView>
        </View>
      );
    }
    return <ChatMessageBubble message={item.message} onMarkWrong={handleMarkWrong} isMarkingWrong={markingWrong.has(item.message.id)} />;
  }, [handleMarkWrong, markingWrong]);

  // The key fix: on iOS, KAV wraps everything including header.
  // On Android, softInputMode="adjustResize" handles keyboard automatically.
  const content = (
    <>
      {/* Messages */}
      {isSessionLoading ? (
        <ChatSkeleton />
      ) : displayItems.length === 0 ? (
        <EmptyState onSuggestion={handleSuggestion} />
      ) : (
        <View style={s.flex}>
          <FlatList
            ref={flatListRef}
            data={displayItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            contentContainerStyle={s.list}
            onScroll={handleScroll}
            scrollEventThrottle={200}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            onContentSizeChange={() => { if (nearBottom) flatListRef.current?.scrollToEnd({ animated: true }); }}
          />
          {!nearBottom ? (
            <Pressable style={s.scrollBtn} onPress={() => { flatListRef.current?.scrollToEnd({ animated: true }); }}>
              <Text style={s.scrollBtnTxt}>↓</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {/* Banners */}
      {error ? (
        <View style={s.banner}><Text style={s.bannerTxt} numberOfLines={2}>{error}</Text></View>
      ) : null}
      {upgradeRequired ? (
        <Pressable style={s.upgradeBanner} onPress={() => router.push('/(app)/pricing')}>
          <Text style={s.upgradeTxt}>Upgrade your plan</Text>
          <Text style={s.upgradeAction}>View Plans →</Text>
        </Pressable>
      ) : null}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isSessionLoading}
        isStreaming={isStreaming}
        onStopGenerating={() => {
          messages.forEach((m) => {
            if (m.isStreaming) useChatStore.getState().setIsStreaming(projectId, m.id, false);
          });
        }}
      />
    </>
  );

  return (
    <View style={s.root}>
      <ChatHeader />
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={s.flex} behavior="padding">
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={s.flex}>
          {content}
        </View>
      )}
      <MarkWrongModal
        visible={markWrongVisible}
        onClose={() => { setMarkWrongVisible(false); setMarkWrongMsg(null); }}
        messageContent={markWrongMsg?.content ?? ''}
        onSubmit={handleMarkWrongSubmit}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgBase },
  flex: { flex: 1 },
  list: { paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[2], gap: spacing[3] },
  banner: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', marginHorizontal: spacing[3], marginBottom: spacing[1], padding: spacing[3], borderRadius: radius.md },
  bannerTxt: { color: colors.error, fontSize: fontSize.sm },
  upgradeBanner: { backgroundColor: colors.signalSubtle, borderWidth: 1, borderColor: colors.signalBorder, marginHorizontal: spacing[3], marginBottom: spacing[1], padding: spacing[3], borderRadius: radius.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  upgradeTxt: { color: colors.signal, fontSize: fontSize.sm },
  upgradeAction: { color: colors.signal, fontSize: fontSize.sm, fontFamily: fonts.monoMedium },
  scrollBtn: { position: 'absolute', bottom: spacing[3], right: spacing[4], width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  scrollBtnTxt: { color: colors.textPrimary, fontSize: fontSize.base },
});

const cmp = StyleSheet.create({
  groupContainer: { gap: spacing[2] },
  groupLabel: { color: colors.textFaint, fontFamily: fonts.mono, fontSize: 11, textTransform: 'uppercase' },
  groupScroll: { gap: spacing[3], paddingRight: spacing[4] },
  card: { width: 280, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, backgroundColor: colors.bgMuted },
  modelName: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '600' },
  streaming: { color: colors.signal, fontSize: 11, fontFamily: fonts.mono },
  cardBody: { padding: spacing[3], maxHeight: 300 },
  content: { color: colors.textPrimary, fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.6 },
  dots: { color: colors.textMuted, fontSize: fontSize.sm },
  error: { color: colors.error, fontSize: fontSize.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  flagBtn: { color: colors.signal, fontFamily: fonts.mono, fontSize: 12 },
  flagged: { color: colors.signal, fontFamily: fonts.mono, fontSize: 11 },
});
