import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useApi } from '../hooks/useApi';
import { useToastStore } from '../store/useToastStore';

type SelectAgentScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, 'SelectAgent'>;
};

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  niche: string;
}

const AVAILABLE_AGENTS: Agent[] = [
  {
    id: 'alex-universal-1',
    name: 'Alex',
    role: 'Universal Assistant',
    description: 'A versatile AI that can help with any task, from content to strategy and everything in between',
    icon: 'sparkles',
    color: '#FF6B6B',
    niche: 'Universal',
  },
  {
    id: 'jordan-universal-2',
    name: 'Jordan',
    role: 'Creative Genius',
    description: 'Unlimited creativity and idea generation - perfect for brainstorming, design, and innovation',
    icon: 'bulb',
    color: '#4ECDC4',
    niche: 'Creative',
  },
  {
    id: 'taylor-universal-3',
    name: 'Taylor',
    role: 'Growth Specialist',
    description: 'Master of growth strategies, optimization, and scaling - applies to any business goal',
    icon: 'trending-up',
    color: '#45B7D1',
    niche: 'Growth',
  },
  {
    id: 'morgan-universal-4',
    name: 'Morgan',
    role: 'Multi-Purpose Expert',
    description: 'Jack of all trades - adapts to whatever your business needs most right now',
    icon: 'cog',
    color: '#9B59B6',
    niche: 'Multi-Purpose',
  },
  {
    id: 'casey-universal-5',
    name: 'Casey',
    role: 'Smart Analyst',
    description: 'Data-driven insights and strategic analysis for any business challenge or opportunity',
    icon: 'analytics',
    color: '#F39C12',
    niche: 'Analysis',
  },
];

export const SelectAgentScreen: React.FC<SelectAgentScreenProps> = ({ navigation, route }) => {
  const businessId = route.params?.businessId;
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { createAgent } = useApi();
  const showToast = useToastStore((state) => state.showToast);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSelectAgent = async (agent: Agent) => {
    if (!businessId) {
      showToast('Business ID not found', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newAgent = await createAgent(businessId, agent.name);
      showToast(`${agent.name} hired successfully!`, 'success');
      navigation.replace('AgentWorkspace', { agentId: newAgent.id });
    } catch (error: any) {
      showToast(error.message || 'Failed to create agent', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAgent = ({ item }: { item: Agent }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleSelectAgent(item)}
      disabled={isLoading}
      style={styles.agentWrapper}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[styles.agentCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardInner}>
            {/* Robot Avatar with Mini Robot */}
            <View
              style={[
                styles.avatar,
                { backgroundColor: item.color },
              ]}
            >
              <Text style={styles.robotEmoji}>🤖</Text>
            </View>

            {/* Agent details */}
            <View style={styles.details}>
              <Text style={[styles.agentName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text
                style={[styles.agentRole, { color: item.color }]}
              >
                {item.role}
              </Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            </View>

            {/* Arrow indicator */}
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Choose AI Employee
        </Text>
        <View style={styles.backBtn} />
      </View>

      {/* Agents list */}
      <FlatList
        data={AVAILABLE_AGENTS}
        renderItem={renderAgent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled
        showsVerticalScrollIndicator={false}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  agentWrapper: {
    marginBottom: Spacing.md,
  },
  agentCard: {
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotEmoji: {
    fontSize: 28,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  agentName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  agentRole: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  description: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginTop: 2,
  },
});
