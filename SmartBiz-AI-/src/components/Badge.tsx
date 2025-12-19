import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  style,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: `${colors.primary}20`, text: colors.primary };
      case 'success':
        return { bg: '#10B98120', text: '#10B981' };
      case 'warning':
        return { bg: '#F59E0B20', text: '#F59E0B' };
      case 'error':
        return { bg: '#EF444420', text: '#EF4444' };
      case 'info':
        return { bg: '#3B82F620', text: '#3B82F6' };
      default:
        return { bg: colors.surface, text: colors.textSecondary };
    }
  };

  const variantColors = getVariantColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: variantColors.bg },
        style,
      ]}
    >
      <Text style={[styles.text, { color: variantColors.text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
