import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

type HeaderProps = {
  title: string;
  subtitle?: string;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  showNotification?: boolean;
  showSearch?: boolean;
  showMenu?: boolean;
  notificationCount?: number;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onNotificationPress,
  onSearchPress,
  onMenuPress,
  showNotification = true,
  showSearch = true,
  showMenu = false,
  notificationCount = 0,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {showMenu && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {showSearch && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onSearchPress}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={22} color={colors.text} />
            </TouchableOpacity>
          )}
          
          {showNotification && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              {notificationCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 0 : Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
});
