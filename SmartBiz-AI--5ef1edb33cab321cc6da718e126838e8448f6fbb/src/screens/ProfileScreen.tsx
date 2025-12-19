import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';

type ProfileScreenProps = {
  navigation: any;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colorScheme, toggleTheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const profileStats = [
    { label: 'Agents', value: '12', icon: 'people' },
    { label: 'Tasks', value: '248', icon: 'checkbox' },
    { label: 'Projects', value: '6', icon: 'folder' },
  ];

  const menuItems = [
    { id: 1, title: 'Edit Profile', icon: 'person-outline', onPress: () => {} },
    { id: 2, title: 'Subscription', icon: 'card-outline', onPress: () => {} },
    { id: 3, title: 'Privacy & Security', icon: 'shield-checkmark-outline', onPress: () => {} },
    { id: 4, title: 'Help & Support', icon: 'help-circle-outline', onPress: () => {} },
    { id: 5, title: 'About', icon: 'information-circle-outline', onPress: () => {} },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
          
          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.icon as any} size={20} color="#fff" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Subscription Card */}
        <View style={styles.section}>
          <Card>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionContent}>
                <View style={[styles.subscriptionBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name="star" size={16} color={colors.accent} />
                  <Text style={[styles.subscriptionBadgeText, { color: colors.accent }]}>PRO</Text>
                </View>
                <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
                  Premium Plan
                </Text>
                <Text style={[styles.subscriptionDescription, { color: colors.textSecondary }]}>
                  Unlimited agents & advanced features
                </Text>
              </View>
              <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.upgradeButtonText}>Manage</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Settings</Text>
          <Card>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: colors.border }]}>
                  <Ionicons name="moon" size={20} color={colors.text} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: colors.border }]}>
                  <Ionicons name="notifications" size={20} color={colors.text} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Account</Text>
          <Card>
            {menuItems.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: colors.border }]}>
                      <Ionicons name={item.icon as any} size={20} color={colors.text} />
                    </View>
                    <Text style={[styles.menuItemText, { color: colors.text }]}>
                      {item.title}
                    </Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
                {index < menuItems.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius.xl * 2,
    borderBottomRightRadius: BorderRadius.xl * 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionContent: {
    flex: 1,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  subscriptionBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  subscriptionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  subscriptionDescription: {
    fontSize: FontSize.sm,
  },
  upgradeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuItemText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  menuBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
