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
      colors={['#00D4FF', '#00A8FF', '#FF6B9D', '#FF4757']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { 
        borderColor: colorScheme === 'dark'
          ? 'rgba(0, 212, 255, 0.3)'
          : 'rgba(0, 212, 255, 0.2)',
      }]}
    >
      {/* Glassmorphism overlay */}
      <View style={[styles.glassmorphismOverlay, {
        backgroundColor: colorScheme === 'dark' 
          ? 'rgba(30, 30, 40, 0.4)'
          : 'rgba(255, 255, 255, 0.15)',
      }]} />
      
      <View style={styles.tabsWrapper}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && styles.activeTab,
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
                  size={24}
                  color={isActive ? '#FFFFFF' : '#FFFFFF'}
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
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 40,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 8,
    flexDirection: 'row',
  },
  glassmorphismOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  tabsWrapper: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
  },
  activeTab: {
    shadowColor: '#FF6B5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
