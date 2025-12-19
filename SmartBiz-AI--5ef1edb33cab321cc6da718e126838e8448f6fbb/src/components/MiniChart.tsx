import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface MiniChartProps {
  data: number[];
  label?: string;
  value?: string;
  color?: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  label,
  value,
  color,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const chartColor = color || colors.primary;

  const maxValue = Math.max(...data, 1);
  const normalizedData = data.map((val) => (val / maxValue) * 100);

  return (
    <View style={styles.container}>
      {(label || value) && (
        <View style={styles.header}>
          {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
          {value && <Text style={[styles.value, { color: colors.text }]}>{value}</Text>}
        </View>
      )}
      <View style={styles.chartContainer}>
        {normalizedData.map((height, index) => (
          <View key={index} style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: `${height}%`,
                  backgroundColor: chartColor,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
  },
  header: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 4,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: BorderRadius.sm,
    minHeight: 4,
  },
});
