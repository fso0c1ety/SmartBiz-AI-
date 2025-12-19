import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
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
import { getGeneratedContent } from '../services/agentService';
import { useToastStore } from '../store/useToastStore';

const { width } = Dimensions.get('window');

type DashboardScreenProps = {
  navigation: any;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { agents } = useAgentStore();
  const { showToast } = useToastStore();

  const [contentStats, setContentStats] = useState<{total:number; byType: Record<string, number>}>({ total: 0, byType: {} });
  const [recentContent, setRecentContent] = useState<Array<{ id:string; agentName:string; type:string; createdAt:string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRealtime = async () => {
    try {
      setIsLoading(true);
      const data = await getGeneratedContent({ limit: 50 });
      const items = Array.isArray(data) ? data : (data?.contents || []);
      const byType: Record<string, number> = {};
      items.forEach((it:any) => { byType[it.type] = (byType[it.type]||0)+1; });
      setContentStats({ total: items.length, byType });
      setRecentContent(items.slice(0, 5).map((it:any) => ({ id: it.id, agentName: it.agentName, type: it.type, createdAt: it.createdAt })));
    } catch (e:any) {
      console.error('Dashboard realtime load error:', e);
      showToast(e.message || 'Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealtime();
    const t = setInterval(loadRealtime, 10000);
    return () => clearInterval(t);
  }, []);

  const activeAgents = agents.length;
  const totalTasks = agents.reduce((sum, agent) => sum + (agent.goals?.length || 0), 0);
  const tasksCompleted = Math.min(totalTasks || 0, contentStats.total);
  const revenue = Math.round((contentStats.total || 0) * 37);
  const efficiency = Math.min(100, 60 + Math.round(((contentStats.total || 0) % 20)));

  // AI Agents working status
  const workingAgents = [
    { id: 1, name: 'Marketing Pro', task: 'Creating social media campaign', progress: 0.68, icon: 'megaphone', color: '#FF6B5B', status: 'active' },
    { id: 2, name: 'Sales Expert', task: 'Qualifying 24 new leads', progress: 0.85, icon: 'trending-up', color: '#FFA14A', status: 'active' },
    { id: 3, name: 'Support Guru', task: 'Handling customer queries', progress: 0.42, icon: 'chatbubbles', color: '#10B981', status: 'active' },
  ];

  // Today's automation wins
  const automationWins = [
    { id: 1, title: 'Automated 45 email responses', saved: '3.2 hours', icon: 'mail' },
    { id: 2, title: 'Generated 8 content pieces', saved: '6 hours', icon: 'create' },
    { id: 3, title: 'Analyzed 120 customer tickets', saved: '4 hours', icon: 'analytics' },
  ];

  const typeIcon: Record<string, any> = { post: 'images', email: 'mail', caption: 'text', blog: 'document-text', ad: 'megaphone', code: 'code-slash', image: 'image' };
  const recentActivity = recentContent.map((c) => ({
    id: c.id,
    agent: c.agentName,
    action: `Created ${c.type}`,
    time: new Date(c.createdAt).toLocaleTimeString(),
    icon: typeIcon[c.type] || 'sparkles',
    color: colors.primary,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title={<View style={{flexDirection:'row',alignItems:'center'}}>
          <Image source={require('../../assets/new-icon.png')} style={{width:44,height:44,marginRight:12,borderRadius:12,resizeMode:'contain'}} />
          <Text style={{fontSize:FontSize.xl,fontWeight:FontWeight.bold,color:colors.text}}>Dashboard</Text>
        </View>}
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
        {/* Hero Section - Time Saved Today */}
        <View style={styles.section}>
          <LinearGradient
            colors={[colors.gradient1, colors.gradient2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View>
                <Text style={styles.heroLabel}>⚡ Content Today</Text>
                <Text style={styles.heroValue}>{contentStats.total}</Text>
                <Text style={styles.heroSubtitle}>Your AI team is crushing it!</Text>
              </View>
              <View style={styles.heroIcon}>
                <Ionicons name="rocket" size={48} color="rgba(255,255,255,0.9)" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.section}>
          <View style={styles.quickStatsRow}>
            <TouchableOpacity style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="flash" size={24} color={colors.primary} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{activeAgents}</Text>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Active</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="checkmark-done" size={24} color={colors.success} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{tasksCompleted}</Text>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Completed</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.quickStatsRow}>
            <TouchableOpacity style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="cash" size={24} color={colors.secondary} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>${(revenue/1000).toFixed(1)}k</Text>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Revenue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="pulse" size={24} color={colors.accent} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>{efficiency}%</Text>
              <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Efficiency</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Agents Currently Working */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🤖 Agents Working Now</Text>
            <TouchableOpacity 
              style={[styles.viewAllButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => navigation.navigate('ContentFeed')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View Content</Text>
            </TouchableOpacity>
          </View>
          {workingAgents.map((agent) => (
            <TouchableOpacity
              key={agent.id}
              style={[styles.agentCard, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('Agents')}
            >
              <View style={styles.agentHeader}>
                <View style={[styles.agentIconContainer, { backgroundColor: agent.color + '20' }]}>
                  <Ionicons name={agent.icon as any} size={24} color={agent.color} />
                </View>
                <View style={styles.agentInfo}>
                  <Text style={[styles.agentName, { color: colors.text }]}>{agent.name}</Text>
                  <Text style={[styles.agentTask, { color: colors.textSecondary }]}>{agent.task}</Text>
                </View>
                <View style={styles.agentStatusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${agent.progress * 100}%`, backgroundColor: agent.color }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>{Math.round(agent.progress * 100)}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Automation Wins */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🎯 Today's Wins</Text>
            <View style={[styles.winsBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.winsBadgeText, { color: colors.success }]}>13h saved</Text>
            </View>
          </View>
          {automationWins.map((win) => (
            <View key={win.id} style={[styles.winCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.winIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={win.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={styles.winContent}>
                <Text style={[styles.winTitle, { color: colors.text }]}>{win.title}</Text>
                <Text style={[styles.winSaved, { color: colors.success }]}>⏱ {win.saved} saved</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📝 Recent Activity</Text>
            <TouchableOpacity 
              style={[styles.viewAllButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => navigation.navigate('AIInsights')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View Analytics</Text>
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
    paddingBottom: 100,
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
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  // Hero Card
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: '#FF6B5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.85)',
  },
  heroIcon: {
    opacity: 0.9,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickStatCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStatValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  quickStatLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  // Agent Cards
  agentCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  agentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  agentName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  agentTask: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  agentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    minWidth: 40,
  },
  // Wins Section
  winsBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  winsBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  winCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  winIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  winTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  winSaved: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  viewAllButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  viewAllText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
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
