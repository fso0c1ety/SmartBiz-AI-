import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  return (
    <LinearGradient
      colors={colorScheme === 'dark' 
        ? ['rgba(255, 107, 91, 0.1)', 'rgba(255, 161, 74, 0.05)']
        : ['rgba(255, 107, 91, 0.08)', 'rgba(255, 161, 74, 0.04)']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { 
        backgroundColor: colorScheme === 'dark' 
          ? 'rgba(45, 37, 32, 0.7)'
          : 'rgba(255, 249, 245, 0.7)',
        borderColor: colorScheme === 'dark'
          ? 'rgba(255, 107, 91, 0.2)'
          : 'rgba(255, 107, 91, 0.15)',
      }]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && [
                styles.activeTab,
                {
                  backgroundColor: colorScheme === 'dark'
                    ? 'rgba(255, 107, 91, 0.3)'
                    : 'rgba(255, 107, 91, 0.2)',
                  borderColor: colors.primary,
                },
              ],
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            {isActive && (
              <LinearGradient
                colors={['#FF6B5B', '#FFA14A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <View style={styles.tabContent}>
              <Ionicons
                name={tab.icon}
                size={20}
                color={isActive ? '#FFFFFF' : colors.textSecondary}
              />
              {isActive && (
                <Text
                  style={[
                    styles.label,
                    { color: '#FFFFFF' },
                  ]}
                >
                  {tab.label}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.xs,
    borderRadius: 50,
    gap: Spacing.xs,
    borderWidth: 1,
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 30,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    shadowColor: '#FF6B5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
