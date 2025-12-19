import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface AgentAvatarProps {
  businessName: string;
  logo?: string;
  size?: number | 'small' | 'medium' | 'large';
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  businessName,
  logo,
  size = 'medium',
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];

  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const fontSize = {
    small: FontSize.sm,
    medium: FontSize.lg,
    large: FontSize.xl,
  };

  const initials = businessName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarSize = typeof size === 'number' ? size : sizeMap[size];
  const textSize = typeof size === 'number' ? size / 3 : fontSize[size];

  return (
    <View
      style={[
        styles.avatar,
        {
          width: avatarSize,
          height: avatarSize,
          backgroundColor: logo ? 'transparent' : colors.primary,
          borderRadius: BorderRadius.md,
        },
      ]}
    >
      {logo ? (
        <Image source={{ uri: logo }} style={styles.logo} />
      ) : (
        <Text style={[styles.initials, { fontSize: textSize }]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
});
