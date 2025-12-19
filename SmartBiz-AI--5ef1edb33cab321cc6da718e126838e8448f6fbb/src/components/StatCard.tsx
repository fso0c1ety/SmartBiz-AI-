import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: number; // positive or negative percentage
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const iconColor = color || colors.primary;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${iconColor}20` },
          ]}
        >
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        {trend !== undefined && (
          <View
            style={[
              styles.trendContainer,
              {
                backgroundColor: trend >= 0 ? '#10B98120' : '#EF444420',
              },
            ]}
          >
            <Ionicons
              name={trend >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={trend >= 0 ? '#10B981' : '#EF4444'}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend >= 0 ? '#10B981' : '#EF4444' },
              ]}
            >
              {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  trendText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  value: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
