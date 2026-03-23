import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

import { colors, spacing } from '@/constants/tokens';
import { CustomDrawerContent } from '@/components/drawer/drawer-content';

function BackToChat() {
  return (
    <Pressable onPress={() => router.back()} style={lay.backBtn} hitSlop={8}>
      <Text style={lay.backArrow}>‹</Text>
    </Pressable>
  );
}

function BackToAccount() {
  return (
    <Pressable onPress={() => router.replace('/(app)/account')} style={lay.backBtn} hitSlop={8}>
      <Text style={lay.backArrow}>‹</Text>
    </Pressable>
  );
}

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={lay.root}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerType: 'front',
          drawerStyle: { backgroundColor: colors.bgSurface, width: 300 },
          overlayColor: colors.overlay,
          swipeEdgeWidth: 30,
          headerShown: false,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{ headerShown: false, swipeEnabled: true }}
        />
        <Drawer.Screen
          name="account"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: true,
            title: 'Account',
            headerStyle: { backgroundColor: colors.bgSurface },
            headerTintColor: colors.textPrimary,
            headerShadowVisible: false,
            headerLeft: () => <BackToChat />,
            swipeEnabled: false,
          }}
        />
        <Drawer.Screen
          name="pricing"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: true,
            title: 'Pricing',
            headerStyle: { backgroundColor: colors.bgSurface },
            headerTintColor: colors.textPrimary,
            headerShadowVisible: false,
            headerLeft: () => <BackToAccount />,
            swipeEnabled: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const lay = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { marginLeft: spacing[3], padding: spacing[1] },
  backArrow: { color: colors.textPrimary, fontSize: 32, fontWeight: '300', lineHeight: 34 },
});
