import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { palette } from '@/src/components/wallet-ui';

function HistoryTabIcon({ color, focused }: { color: string; focused: boolean }) {
  if (focused) {
    return (
      <View style={styles.activeHistoryIcon}>
        <MaterialIcons name="history" size={20} color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.inactiveIconFrame}>
      <MaterialIcons name="history" size={28} color={color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.brand,
        tabBarInactiveTintColor: palette.faint,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: palette.line,
          minHeight: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          title: 'Transfer',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.up.arrow.down" color={color} />,
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: 'Swap',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.triangle.2.circlepath" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => <HistoryTabIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeHistoryIcon: {
    alignItems: 'center',
    backgroundColor: palette.brand,
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  inactiveIconFrame: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
});
