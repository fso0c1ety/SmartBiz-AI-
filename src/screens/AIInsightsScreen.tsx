import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

const { width } = Dimensions.get('window');

type AIInsightsScreenProps = {
  navigation: any;
};

export const AIInsightsScreen: React.FC<AIInsightsScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const insights = [
    {
      id: 1,
      title: 'Peak Performance Time',
      value: '2-4 PM',
      description: 'Your AI agents perform best during afternoon hours',
      icon: 'time',
      color: colors.primary,
      trend: '+15%',
    },
    {
      id: 2,
      title: 'Most Efficient Agent',
      value: 'Sales AI',
      description: 'Generated $4.2k in revenue this week',
      icon: 'trophy',
      color: colors.secondary,
      trend: '+28%',
    },
    {
      id: 3,
      title: 'Task Completion Rate',
      value: '94.2%',
      description: 'Up from 87% last week',
      icon: 'checkmark-circle',
      color: colors.success,
      trend: '+7.2%',
    },
  ];

  const agentPerformance = [
    { name: 'Marketing AI', score: 96, tasks: 145, revenue: 3800, color: '#FF6B5B' },
    { name: 'Sales AI', score: 94, tasks: 132, revenue: 4200, color: '#FFA14A' },
    { name: 'Support AI', score: 91, tasks: 189, revenue: 2100, color: '#10B981' },
    { name: 'Content AI', score: 88, tasks: 98, revenue: 1900, color: '#3B82F6' },
  ];

  const recommendations = [
    {
      id: 1,
      title: 'Optimize Marketing AI',
      description: 'Consider increasing daily task limit by 20%',
      impact: 'High',
      icon: 'trending-up',
    },
    {
      id: 2,
      title: 'Schedule Maintenance',
      description: 'Support AI needs model refresh',
      impact: 'Medium',
      icon: 'construct',
    },
    {
      id: 3,
      title: 'Add New Agent',
      description: 'Customer data analysis shows opportunity',
      impact: 'High',
      icon: 'add-circle',
    },
  ];

  const periods = ['day', 'week', 'month', 'year'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="AI Insights"
        subtitle="Performance analytics"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.section}>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor: selectedPeriod === period ? colors.primary : colors.surface,
                  },
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodText,
                    {
                      color: selectedPeriod === period ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: selectedPeriod === period ? FontWeight.bold : FontWeight.medium,
                    },
                  ]}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎯 Key Insights</Text>
          {insights.map((insight) => (
            <Card key={insight.id} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
                  <Ionicons name={insight.icon as any} size={24} color={insight.color} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={[styles.insightTitle, { color: colors.text }]}>
                    {insight.title}
                  </Text>
                  <Text style={[styles.insightValue, { color: colors.text }]}>
                    {insight.value}
                  </Text>
                  <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
                    {insight.description}
                  </Text>
                </View>
                <View style={[styles.trendBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.trendText, { color: colors.success }]}>
                    {insight.trend}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Agent Performance Comparison */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Agent Performance</Text>
          <Card>
            {agentPerformance.map((agent, index) => (
              <View key={agent.name}>
                <TouchableOpacity style={styles.performanceRow}>
                  <View style={styles.performanceLeft}>
                    <View style={[styles.performanceRank, { backgroundColor: agent.color + '20' }]}>
                      <Text style={[styles.rankText, { color: agent.color }]}>#{index + 1}</Text>
                    </View>
                    <View>
                      <Text style={[styles.performanceName, { color: colors.text }]}>
                        {agent.name}
                      </Text>
                      <View style={styles.performanceMetrics}>
                        <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                          {agent.tasks} tasks
                        </Text>
                        <Text style={[styles.metricDivider, { color: colors.border }]}> • </Text>
                        <Text style={[styles.metricText, { color: colors.success }]}>
                          ${agent.revenue}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.performanceRight}>
                    <Text style={[styles.scoreText, { color: colors.text }]}>{agent.score}</Text>
                    <View style={styles.scoreBar}>
                      <View
                        style={[
                          styles.scoreBarFill,
                          { width: `${agent.score}%`, backgroundColor: agent.color },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                {index < agentPerformance.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* AI Recommendations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💡 Recommendations</Text>
          {recommendations.map((rec) => (
            <TouchableOpacity
              key={rec.id}
              style={[styles.recommendationCard, { backgroundColor: colors.surface }]}
            >
              <View style={[styles.recIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={rec.icon as any} size={22} color={colors.primary} />
              </View>
              <View style={styles.recContent}>
                <View style={styles.recHeader}>
                  <Text style={[styles.recTitle, { color: colors.text }]}>{rec.title}</Text>
                  <View
                    style={[
                      styles.impactBadge,
                      {
                        backgroundColor:
                          rec.impact === 'High'
                            ? colors.primary + '20'
                            : colors.secondary + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.impactText,
                        {
                          color: rec.impact === 'High' ? colors.primary : colors.secondary,
                        },
                      ]}
                    >
                      {rec.impact}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.recDescription, { color: colors.textSecondary }]}>
                  {rec.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
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
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: 4,
    borderRadius: BorderRadius.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  periodText: {
    fontSize: FontSize.sm,
  },
  // Insights
  insightCard: {
    marginBottom: Spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  insightTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: FontSize.sm,
  },
  trendBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  trendText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  // Performance
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  performanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  performanceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  performanceName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  performanceMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: FontSize.xs,
  },
  metricDivider: {
    fontSize: FontSize.xs,
  },
  performanceRight: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  scoreBar: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: -Spacing.lg,
  },
  // Recommendations
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  impactBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  impactText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  recDescription: {
    fontSize: FontSize.sm,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
