import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface Tab {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const isLight = colorScheme === 'light';

  return (
    <View style={[styles.container, isLight ? { backgroundColor: '#FFFFFF' } : { backgroundColor: colors.surface }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && [styles.activeTab, { backgroundColor: colors.primary }],
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={isActive ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: BorderRadius.lg,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
