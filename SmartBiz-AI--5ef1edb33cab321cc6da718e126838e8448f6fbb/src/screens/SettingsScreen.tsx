import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAgentStore } from '../store/useAgentStore';
import { useToastStore } from '../store/useToastStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { colorScheme, toggleTheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { user, logout } = useAuthStore();
  const { agents, clearAgents } = useAgentStore();
  const { showToast } = useToastStore();

  const handleLogout = async () => {
    await logout();
    clearAgents();
    showToast('Logged out successfully', 'success');
    navigation.navigate('Welcome');
  };

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightElement,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.settingsItemText}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingsSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Account Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => showToast('Edit profile coming soon!', 'info')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="card-outline"
            title="Subscription"
            subtitle="Manage your subscription plan"
            onPress={() => showToast('Subscription management coming soon!', 'info')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => showToast('Change password coming soon!', 'info')}
          />
        </Card>

        {/* AI Agents */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Agents</Text>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="briefcase-outline"
            title="Manage Agents"
            subtitle={`${agents.length} AI agents active`}
            onPress={() => navigation.navigate('Home')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="add-circle-outline"
            title="Create New Agent"
            subtitle="Add another AI agent"
            onPress={() => navigation.navigate('CreateAgent')}
          />
        </Card>

        {/* App Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          App Settings
        </Text>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle={colorScheme === 'dark' ? 'Enabled' : 'Disabled'}
            showArrow={false}
            rightElement={
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => showToast('Notifications settings coming soon!', 'info')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => showToast('Language settings coming soon!', 'info')}
          />
        </Card>

        {/* Support */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="help-circle-outline"
            title="Help & FAQ"
            onPress={() => showToast('Help center coming soon!', 'info')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="mail-outline"
            title="Contact Support"
            onPress={() => showToast('Contact support coming soon!', 'info')}
          />
          <View style={styles.divider} />
          <SettingsItem
            icon="document-text-outline"
            title="Terms & Privacy"
            onPress={() => showToast('Legal documents coming soon!', 'info')}
          />
        </Card>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Card style={styles.settingsCard}>
          <SettingsItem
            icon="information-circle-outline"
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
          />
        </Card>

        {/* Logout Button */}
        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="outline"
          fullWidth
          size="large"
          style={styles.logoutButton}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            SmartBiz AI Agents v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: FontSize.sm,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  settingsCard: {
    marginBottom: Spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsItemText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingsTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  settingsSubtitle: {
    fontSize: FontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 60,
  },
  logoutButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.xs,
  },
});
