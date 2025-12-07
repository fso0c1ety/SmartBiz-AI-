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
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    };

    // Size
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
      medium: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
      large: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
    };

    // Variant
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: colors.secondary,
      },
      secondary: {
        backgroundColor: colors.surface,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.secondary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.6 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: FontSize.sm },
      medium: { fontSize: FontSize.base },
      large: { fontSize: FontSize.lg },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF' },
      secondary: { color: colors.text },
      outline: { color: colors.secondary },
      ghost: { color: colors.secondary },
    };

    return {
      fontWeight: FontWeight.bold,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : colors.primary}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
