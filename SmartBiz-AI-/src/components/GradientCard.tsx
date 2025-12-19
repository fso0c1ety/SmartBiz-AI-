import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Spacing } from '../constants/spacing';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  noPadding?: boolean;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  style,
  colors = ['#FF6B5B', '#FFA14A'],
  noPadding = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={[styles.content, !noPadding && styles.contentPadding]}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#FF6B5B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  gradient: {
    borderRadius: BorderRadius.xl,
  },
  content: {
    borderRadius: BorderRadius.xl,
  },
  contentPadding: {
    padding: Spacing.xl,
  },
});
