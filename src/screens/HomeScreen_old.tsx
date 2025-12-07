import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { GradientCard } from '../components/GradientCard';
import { StatCard } from '../components/StatCard';
import { SearchBar } from '../components/SearchBar';
import { Badge } from '../components/Badge';
import { AgentAvatar } from '../components/AgentAvatar';
import { CardSkeleton } from '../components/Skeleton';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore, AIAgent } from '../store/useAgentStore';
import { useAuthStore } from '../store/useAuthStore';
import { useApi } from '../hooks/useApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { agents, selectAgent, setAgents } = useAgentStore();
  const { isAuthenticated } = useAuthStore();
  const { getAllBusinesses } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Load user's agents when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAgents();
    }
  }, [isAuthenticated]);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const businesses = await getAllBusinesses();
      
      // Transform businesses to agents format
      const loadedAgents: AIAgent[] = businesses.map((business: any) => ({
        id: business.agents?.[0]?.id || business.id,
        businessName: business.name,
        industry: business.industry || '',
        description: business.description || '',
        targetAudience: business.targetAudience || '',
        brandTone: business.brandTone || '',
        socialLinks: business.socialLinks || {},
        logo: business.logoUrl,
        brandColors: business.brandColors || { primary: '#6366F1', secondary: '#8B5CF6' },
        goals: business.goals || [],
        role: business.agents?.[0]?.agentName || 'AI Marketing Manager',
        createdAt: new Date(business.createdAt),
      }));
      
      setAgents(loadedAgents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAgents();
  };

  const handleAgentPress = (agent: AIAgent) => {
    selectAgent(agent);
    navigation.navigate('AgentWorkspace');
  };

  const filteredAgents = agents.filter((agent) =>
    agent.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTasks = agents.reduce((sum, agent) => sum + (agent.goals?.length || 0), 0);
  const activeAgents = agents.length;

  const renderAgentCard = ({ item }: { item: AIAgent }) => (
    <TouchableOpacity
      onPress={() => handleAgentPress(item)}
      activeOpacity={0.7}
      style={viewMode === 'grid' ? styles.gridItem : undefined}
    >
      <Card style={[styles.agentCard, viewMode === 'grid' && styles.gridCard]}>
        <View style={styles.cardHeader}>
          <AgentAvatar businessName={item.businessName} logo={item.logo} size={viewMode === 'grid' ? 40 : 50} />
          <View style={styles.statusDot}>
            <View style={[styles.dotInner, { backgroundColor: '#10B981' }]} />
          </View>
        </View>

        <View style={styles.agentInfo}>
          <Text style={[styles.businessName, { color: colors.text }]} numberOfLines={1}>
            {item.businessName}
          </Text>
          <View style={styles.infoRow}>
            <Badge text={item.industry} variant="default" />
            <Text style={[styles.role, { color: colors.textSecondary }]} numberOfLines={1}>
              • {item.role}
            </Text>
          </View>
        </View>

        {viewMode === 'list' && (
          <View style={styles.footer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  {item.goals?.length || 0} goals
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  Active
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.emptyIcon}>🤖</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No AI Employees Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Create your first AI employee to get started
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('SelectAgent')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Create AI Employee</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header Component */}
      <Header
        title="My AI Employees"
        subtitle={`${activeAgents} active agents`}
        showNotification={false}
        showSearch={false}
      />

      <View style={styles.content}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        {agents.length > 0 && (
          <Animated.View style={[styles.statsSection, { opacity: fadeAnim }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
              <StatCard
                title="Active Agents"
                value={activeAgents}
                icon="people"
                trend={15}
                color={colors.primary}
              />
              <StatCard
                title="Total Goals"
                value={totalTasks}
                icon="flag"
                trend={8}
                color="#10B981"
              />
              <StatCard
                title="This Week"
                value="12"
                icon="calendar"
                trend={-3}
                color="#F59E0B"
              />
            </ScrollView>
          </Animated.View>
        )}

        {/* Search and View Toggle */}
        {agents.length > 0 && (
          <View style={styles.controlsSection}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search AI employees..."
            />
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === 'list' && [styles.viewButtonActive, { backgroundColor: colors.primary }]
                ]}
                onPress={() => setViewMode('list')}
              >
                <Ionicons
                  name="list"
                  size={20}
                  color={viewMode === 'list' ? '#FFFFFF' : colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === 'grid' && [styles.viewButtonActive, { backgroundColor: colors.primary }]
                ]}
                onPress={() => setViewMode('grid')}
              >
                <Ionicons
                  name="grid"
                  size={20}
                  color={viewMode === 'grid' ? '#FFFFFF' : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Agents List */}
        <FlatList
          data={filteredAgents}
          renderItem={renderAgentCard}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={isLoading ? null : renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          scrollEnabled={false}
        />
      </ScrollView>
      </View>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => navigation.navigate('SetupBusiness')}
        icon="add"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    marginBottom: Spacing.md,
  },
  statsScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  controlsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  viewButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  viewButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  gridItem: {
    width: '48%',
    marginRight: '4%',
  },
  agentCard: {
    marginBottom: Spacing.md,
  },
  gridCard: {
    marginRight: 0,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    right: '35%',
    top: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  agentInfo: {
    marginBottom: Spacing.sm,
  },
  businessName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  role: {
    fontSize: FontSize.xs,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FontSize.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
