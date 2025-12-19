import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  color?: string;
  showPercentage?: boolean;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  color,
  showPercentage = true,
  height = 8,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const barColor = color || colors.primary;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && (
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          )}
          {showPercentage && (
            <Text style={[styles.percentage, { color: colors.textSecondary }]}>
              {clampedProgress.toFixed(0)}%
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          { backgroundColor: colors.surface, height },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: barColor,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  percentage: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  track: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
