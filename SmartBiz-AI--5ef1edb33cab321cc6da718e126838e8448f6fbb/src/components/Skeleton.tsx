import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.row}>
        <Skeleton width={60} height={60} borderRadius={BorderRadius.md} />
        <View style={styles.content}>
          <Skeleton width="70%" height={16} style={{ marginBottom: Spacing.sm }} />
          <Skeleton width="50%" height={14} style={{ marginBottom: Spacing.xs }} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardSkeleton: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
});
