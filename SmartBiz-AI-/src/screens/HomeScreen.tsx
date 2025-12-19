import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore, AIAgent } from '../store/useAgentStore';
import { useAuthStore } from '../store/useAuthStore';
import { useApi } from '../hooks/useApi';
import { useToastStore } from '../store/useToastStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { agents, selectAgent, setAgents, deleteAgent: deleteAgentFromStore } = useAgentStore();
  const { isAuthenticated } = useAuthStore();
  const { getAllBusinesses, deleteBusiness } = useApi();
  const { showToast } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<AIAgent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'idle'>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getAgentIcon = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('marketing')) return 'analytics';
    if (lowerRole.includes('sales')) return 'trending-up';
    if (lowerRole.includes('support')) return 'cog';
    if (lowerRole.includes('content')) return 'bulb';
    return 'business';
  };

  // Simulate real-time agent activity
  const [agentActivity, setAgentActivity] = useState<Record<string, { status: 'active' | 'idle', task: string, progress: number }>>({});

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        loadAgents();
      }
    }, [isAuthenticated])
  );

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const businesses = await getAllBusinesses();

      const loadedAgents: AIAgent[] = businesses.map((business: any) => ({
        id: business.agents?.[0]?.id || business.id,
        businessId: business.id,
        businessName: business.name,
        industry: business.industry || '',
        description: business.description || '',
        targetAudience: business.targetAudience || '',
        brandTone: business.brandTone || '',
        socialLinks: business.socialLinks || {},
        logo: business.logoUrl,
        brandColors: business.brandColors || { primary: '#2563EB', secondary: '#1F2937' },
        goals: business.goals || [],
        role: business.agents?.[0]?.agentName || 'AI Agent',
        createdAt: new Date(business.createdAt),
      }));

      setAgents(loadedAgents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePress = (agent: AIAgent) => {
    setAgentToDelete(agent);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return;

    setIsDeleting(true);
    try {
      const businessIdToDelete = agentToDelete.businessId || agentToDelete.id;
      await deleteBusiness(businessIdToDelete);
      deleteAgentFromStore(agentToDelete.id);
      showToast(`${agentToDelete.businessName} removed successfully`, 'success');
      setDeleteModalVisible(false);
      setAgentToDelete(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to remove agent', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    loadAgents();
  };

  const handleAgentPress = (agent: AIAgent) => {
    selectAgent(agent);
    navigation.navigate('AgentWorkspace');
  };

  const renderAgentCard = ({ item, index }: { item: AIAgent; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleAgentPress(item)}
      style={styles.cardWrapper}
    >
      <Animated.View style={[{ opacity: fadeAnim }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardContent}>
            {/* Agent header */}
            <View style={styles.agentHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                {item.logo ? (
                  <Image source={{ uri: item.logo }} style={styles.logoImage} />
                ) : (
                  <Ionicons name={getAgentIcon(item.role) as any} size={24} color={colors.primary} />
                )}
              </View>
              <View style={styles.agentInfo}>
                <Text style={[styles.roleName, { color: colors.text }]} numberOfLines={1}>
                  {item.role}
                </Text>
                <Text style={[styles.businessName, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.businessName}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>

            {/* Description */}
            {item.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {/* Industry badge and delete button */}
            {item.industry && (
              <View style={styles.footer}>
                <View style={[styles.industryBadge, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                    {item.industry}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePress(item)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
        <Ionicons name="sparkles-outline" size={40} color={colors.textTertiary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No AI Agents Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Create your first AI agent to get started
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateAgent')}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.createButtonText}>Create Agent</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Image source={require('../../assets/new-icon.png')} style={styles.headerLogo} />
          <Text style={[styles.title, { color: colors.text }]}>SmartBiz AI</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateAgent')}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Agents list */}
      <FlatList
        data={agents}
        renderItem={renderAgentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={agents.length > 0}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* Floating Action Button */}
      {/* {agents.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreateAgent')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )} */}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <View style={styles.modalIcon}>
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Remove AI Agent?
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to remove {agentToDelete?.businessName}? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surface }]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButtonConfirm]}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  {isDeleting ? 'Removing...' : 'Remove'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    resizeMode: 'contain',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSize.sm,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  agentInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  businessName: {
    fontSize: FontSize.sm,
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  industryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  createButtonText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  deleteButton: {
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  modalIcon: {
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonConfirm: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
});
