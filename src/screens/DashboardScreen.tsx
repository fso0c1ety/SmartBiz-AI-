import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { MiniChart } from '../components/MiniChart';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore } from '../store/useAgentStore';

const { width } = Dimensions.get('window');

type DashboardScreenProps = {
  navigation: any;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { agents } = useAgentStore();

  const activeAgents = agents.length;
  const totalTasks = agents.reduce((sum, agent) => sum + (agent.goals?.length || 0), 0);

  const recentActivity = [
    { id: 1, agent: 'Sales AI', action: 'Generated 12 leads', time: '5 min ago', icon: 'trending-up', color: colors.success },
    { id: 2, agent: 'Content AI', action: 'Created blog post', time: '1 hour ago', icon: 'create', color: colors.primary },
    { id: 3, agent: 'Support AI', action: 'Resolved 8 tickets', time: '2 hours ago', icon: 'checkmark-circle', color: colors.accent },
    { id: 4, agent: 'Marketing AI', action: 'Campaign analytics ready', time: '3 hours ago', icon: 'analytics', color: colors.secondary },
  ];

  const quickActions = [
    { id: 1, title: 'New Agent', icon: 'add-circle', color: colors.primary, onPress: () => navigation.navigate('CreateAgent') },
    { id: 2, title: 'Analytics', icon: 'stats-chart', color: colors.accent, onPress: () => {} },
    { id: 3, title: 'Reports', icon: 'document-text', color: colors.secondary, onPress: () => {} },
    { id: 4, title: 'Settings', icon: 'settings', color: colors.textSecondary, onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Dashboard"
        subtitle="Welcome back!"
        notificationCount={3}
        onNotificationPress={() => {}}
        onSearchPress={() => {}}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <StatCard
                title="Active Agents"
                value={activeAgents.toString()}
                icon="people"
                trend={12}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                title="Tasks Done"
                value={totalTasks.toString()}
                icon="checkmark-done"
                trend={8}
              />
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <StatCard
                title="Revenue"
                value="$12.5k"
                icon="trending-up"
                trend={23}
              />
            </View>
            <View style={styles.statItem}>
              <StatCard
                title="Efficiency"
                value="94%"
                icon="speedometer"
                trend={5}
              />
            </View>
          </View>
        </View>

        {/* Performance Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
          <Card>
            <View style={styles.chartHeader}>
              <View>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Overview</Text>
                <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
                  Last 7 days
                </Text>
              </View>
              <View style={[styles.chartBadge, { backgroundColor: colors.successLight }]}>
                <Ionicons name="trending-up" size={16} color={colors.success} />
                <Text style={[styles.chartBadgeText, { color: colors.success }]}>+18%</Text>
              </View>
            </View>
            <MiniChart data={[45, 52, 48, 65, 58, 72, 68]} />
          </Card>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <Card>
            {recentActivity.map((item, index) => (
              <View key={item.id}>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityAgent, { color: colors.text }]}>
                      {item.agent}
                    </Text>
                    <Text style={[styles.activityAction, { color: colors.textSecondary }]}>
                      {item.action}
                    </Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                    {item.time}
                  </Text>
                </View>
                {index < recentActivity.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </Card>
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
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  chartSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  chartBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickAction: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityAgent: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  activityAction: {
    fontSize: FontSize.sm,
  },
  activityTime: {
    fontSize: FontSize.xs,
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
