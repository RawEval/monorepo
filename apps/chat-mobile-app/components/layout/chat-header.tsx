import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { router } from 'expo-router';

import { colors, spacing, radius, fontSize } from '@/constants/tokens';
import { useProjectsStore } from '@/stores/projects-store';
import { useAuthStore } from '@/stores/auth-store';

const logoSource = require('@/assets/images/logo.png');

/** Cross-platform hamburger icon (SF Symbols only works on iOS) */
function MenuIcon() {
  return (
    <View style={iconStyles.menu}>
      <View style={iconStyles.line} />
      <View style={[iconStyles.line, iconStyles.lineShort]} />
      <View style={iconStyles.line} />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  menu: { width: 20, height: 16, justifyContent: 'space-between' },
  line: { width: 20, height: 2, backgroundColor: colors.textSecondary, borderRadius: 1 },
  lineShort: { width: 14 },
});

export function ChatHeader() {
  const navigation = useNavigation();
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId);
  const projects = useProjectsStore((s) => s.projects);
  const user = useAuthStore((s) => s.user);

  const project = projects.find((p) => p.id === selectedProjectId);
  const title = project?.title;
  const isNewChat = !title || title === 'New Chat';
  const initials = user?.full_name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.bar}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          hitSlop={10}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          accessibilityLabel="Open menu"
        >
          <MenuIcon />
        </Pressable>

        <View style={styles.center}>
          {isNewChat ? (
            <Image source={logoSource} style={styles.logo} resizeMode="contain" tintColor={colors.signal} />
          ) : (
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          )}
        </View>

        <Pressable
          onPress={() => router.push('/(app)/account')}
          hitSlop={10}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          accessibilityLabel="Account"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bgBase },
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[3], paddingVertical: spacing[2], gap: spacing[2] },
  iconBtn: { padding: spacing[2], borderRadius: radius.md },
  pressed: { backgroundColor: colors.bgMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 110, height: 32 },
  title: { fontSize: fontSize.base, fontWeight: '600', color: colors.textPrimary },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bgMuted, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: colors.textPrimary, fontWeight: '700', fontSize: 12 },
});
