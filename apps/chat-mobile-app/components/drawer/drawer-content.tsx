import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { isToday, isYesterday, subDays, isAfter } from 'date-fns';

import { Text, View, Input } from '@/components/ui';
import { PromptModal } from '@/components/prompt-modal';
import { colors, spacing, radius, fontSize, fonts, letterSpacing } from '@/constants/tokens';
import { useProjectsStore, type Project } from '@/stores/projects-store';
import { useChatStore } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';

// ---------------------------------------------------------------------------
// Time grouping
// ---------------------------------------------------------------------------

interface GroupedSection {
  label: string;
  data: Project[];
}

type FlatItem =
  | { type: 'header'; label: string; key: string }
  | { type: 'item'; project: Project; key: string };

function groupProjectsByTime(projects: Project[]): GroupedSection[] {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const buckets: Record<string, Project[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    Older: [],
  };

  for (const p of projects) {
    const d = new Date(p.updatedAt);
    if (isToday(d)) buckets['Today']!.push(p);
    else if (isYesterday(d)) buckets['Yesterday']!.push(p);
    else if (isAfter(d, sevenDaysAgo)) buckets['Previous 7 Days']!.push(p);
    else buckets['Older']!.push(p);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, data]) => ({ label, data }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const [search, setSearch] = useState('');
  const [renamePrompt, setRenamePrompt] = useState<{ id: string; title: string } | null>(null);

  const user = useAuthStore((s) => s.user);
  const projects = useProjectsStore((s) => s.projects);
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const isLoadingProjects = useProjectsStore((s) => s.isLoading);
  const loadProjects = useProjectsStore((s) => s.loadProjects);
  const selectProject = useProjectsStore((s) => s.selectProject);
  const renameProject = useProjectsStore((s) => s.renameProject);
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const createProject = useProjectsStore((s) => s.createProject);
  const clearProject = useChatStore((s) => s.clearProject);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Filter + group
  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, search]);

  const flatData: FlatItem[] = useMemo(() => {
    const sections = groupProjectsByTime(filtered);
    const items: FlatItem[] = [];
    for (const s of sections) {
      items.push({ type: 'header', label: s.label, key: `h-${s.label}` });
      for (const p of s.data) {
        items.push({ type: 'item', project: p, key: p.id });
      }
    }
    return items;
  }, [filtered]);

  // Handlers
  const handleSelect = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      selectProject(id);
      props.navigation.closeDrawer();
    },
    [selectProject, props.navigation],
  );

  const handleLongPress = useCallback(
    (p: Project) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(p.title, undefined, [
        {
          text: 'Rename',
          onPress: () => setRenamePrompt({ id: p.id, title: p.title }),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete Chat', `Delete "${p.title}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteProject(p.id) },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [renameProject, deleteProject],
  );

  const handleNewChat = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if there's already an empty chat we can reuse
    const store = useChatStore.getState();
    const existingEmpty = projects.find((p) => {
      const msgs = store.messagesByProject[p.id];
      return (!msgs || msgs.length === 0) && (p.title === 'New Chat' || !p.backendId);
    });

    if (existingEmpty) {
      // Reuse existing empty chat
      selectProject(existingEmpty.id);
    } else {
      // Create new one
      const id = createProject();
      clearProject(id);
      selectProject(id);
    }
    props.navigation.closeDrawer();
  }, [projects, createProject, clearProject, selectProject, props.navigation]);

  const handleAccount = useCallback(() => {
    props.navigation.closeDrawer();
    router.push('/(app)/account');
  }, [props.navigation]);

  const initials = user?.full_name?.charAt(0)?.toUpperCase() ?? '?';

  // Render
  const renderItem = useCallback(
    ({ item }: { item: FlatItem }) => {
      if (item.type === 'header') {
        return <Text style={styles.sectionLabel}>{item.label}</Text>;
      }

      const p = item.project;
      const active = p.id === selectedProjectId;

      return (
        <Pressable
          onPress={() => handleSelect(p.id)}
          onLongPress={() => handleLongPress(p)}
          delayLongPress={500}
          style={({ pressed }) => [
            styles.chatRow,
            active && styles.chatRowActive,
            pressed && !active && styles.chatRowPressed,
          ]}
        >
          <Text
            style={[styles.chatTitle, active && styles.chatTitleActive]}
            numberOfLines={1}
          >
            {p.title}
          </Text>
        </Pressable>
      );
    },
    [selectedProjectId, handleSelect, handleLongPress],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header: avatar + name + new chat */}
      <View style={styles.header}>
        <Pressable onPress={handleAccount} style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.full_name ?? 'User'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email ?? ''}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={handleNewChat}
          hitSlop={8}
          style={({ pressed }) => [styles.newChatIcon, pressed && styles.iconPressed]}
          accessibilityLabel="New chat"
        >
          <Text style={{ color: colors.signal, fontSize: 18 }}>✎</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Input variant="ghost" placeholder="Search chats..." value={search} onChangeText={setSearch} />
      </View>

      {/* Chat list */}
      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>
              {isLoadingProjects ? 'Loading chats...' : 'No chats yet'}
            </Text>
          </View>
        }
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleAccount}
          style={({ pressed }) => [styles.footerBtn, pressed && styles.footerBtnPressed]}
        >
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>⚙</Text>
          <Text style={styles.footerTxt}>Settings & Account</Text>
        </Pressable>
      </View>
      <PromptModal
        visible={renamePrompt !== null}
        title="Rename Chat"
        message="Enter new name:"
        defaultValue={renamePrompt?.title}
        onSubmit={(v) => { if (renamePrompt) renameProject(renamePrompt.id, v); setRenamePrompt(null); }}
        onCancel={() => setRenamePrompt(null)}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgSurface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: fontSize.base,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  userEmail: {
    color: colors.textFaint,
    fontSize: 11,
    fontFamily: fonts.mono,
  },
  newChatIcon: {
    padding: spacing[2],
    borderRadius: radius.sm,
  },
  iconPressed: {
    backgroundColor: colors.bgMuted,
  },

  // Search
  searchWrap: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing[4],
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: fonts.monoMedium,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wider,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[1],
  },
  chatRow: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginHorizontal: spacing[2],
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  chatRowActive: {
    backgroundColor: colors.bgMuted,
  },
  chatRowPressed: {
    backgroundColor: colors.bgElevated,
  },
  chatTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chatTitleActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  empty: {
    paddingTop: spacing[10],
    alignItems: 'center',
  },
  emptyTxt: {
    color: colors.textFaint,
    fontSize: fontSize.sm,
  },

  // Footer
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  footerBtn: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
    borderRadius: radius.md,
  },
  footerBtnPressed: {
    backgroundColor: colors.bgMuted,
  },
  footerTxt: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
