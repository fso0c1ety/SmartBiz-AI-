import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { BorderRadius, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

type FloatingActionButtonProps = {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Ionicons name={icon} size={28} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    right: Spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999,
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
