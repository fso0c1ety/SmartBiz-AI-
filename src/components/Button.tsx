import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      overflow: 'hidden',
      shadowColor: variant === 'primary' ? colors.gradient1 : '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: variant === 'primary' ? 0.25 : 0.08,
      shadowRadius: 12,
      elevation: variant === 'primary' ? 6 : 3,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingVertical: 8, paddingHorizontal: Spacing.md },
      medium: { paddingVertical: 12, paddingHorizontal: Spacing.lg },
      large: { paddingVertical: 16, paddingHorizontal: Spacing.xl },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {},
      secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
      outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
      ghost: { backgroundColor: 'transparent' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.5 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: FontSize.sm },
      medium: { fontSize: FontSize.base },
      large: { fontSize: FontSize.lg },
    };

    const variantText: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF' },
      secondary: { color: colors.text },
      outline: { color: colors.secondary },
      ghost: { color: colors.secondary },
    };

    return {
      fontWeight: FontWeight.bold,
      ...sizeStyles[size],
      ...variantText[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.75}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={[colors.gradient1, colors.gradient2]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.gradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      ) : isLoading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
