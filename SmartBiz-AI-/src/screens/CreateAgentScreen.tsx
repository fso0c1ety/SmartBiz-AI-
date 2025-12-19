
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore } from '../store/useAgentStore';
import { useToastStore } from '../store/useToastStore';
import { useApi } from '../hooks/useApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type CreateAgentScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface AgentOption {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
}

const AGENT_OPTIONS: AgentOption[] = [
  {
    id: 'marketing-ai-1',
    name: 'Marketing AI',
    role: 'Marketing AI',
    description: 'Specialized in marketing strategies, campaigns, and customer engagement',
    icon: 'analytics',
    color: '#FF6B6B',
  },
  {
    id: 'sales-ai-2',
    name: 'Sales',
    role: 'Sales',
    description: 'Expert in sales processes, lead generation, and closing deals',
    icon: 'trending-up',
    color: '#4ECDC4',
  },
  {
    id: 'support-ai-3',
    name: 'Support',
    role: 'Support',
    description: 'Handles customer support, troubleshooting, and assistance',
    icon: 'cog',
    color: '#45B7D1',
  },
  {
    id: 'content-ai-4',
    name: 'Content',
    role: 'Content',
    description: 'Creates engaging content, copywriting, and media production',
    icon: 'bulb',
    color: '#9B59B6',
  },
];

export const CreateAgentScreen: React.FC<CreateAgentScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { addAgent } = useAgentStore();
  const { showToast } = useToastStore();
  const { createAgent } = useApi();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSelectAgent = async (agent: AgentOption) => {
    setIsLoading(true);
    try {
      // You may want to update this logic to fit your backend
      const newAgent = await createAgent(agent.name); // No business info
      addAgent({
        id: newAgent.id,
        businessName: '',
        industry: '',
        description: '',
        targetAudience: '',
        brandTone: '',
        socialLinks: {},
        logo: '',
        brandColors: { primary: '', secondary: '' },
        goals: [],
        role: agent.role,
        createdAt: new Date(newAgent.createdAt),
      });
      showToast(`${agent.name} agent created!`, 'success');
      navigation.navigate('Home');
    } catch (error: any) {
      showToast(error.message || 'Failed to create agent', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAgent = ({ item }: { item: AgentOption }) => (
    <TouchableOpacity
      style={[styles.agentCard, { backgroundColor: colors.card }]}
      onPress={() => handleSelectAgent(item)}
      disabled={isLoading}
    >
      <View style={[styles.avatar, { backgroundColor: item.color }]}> 
        <Ionicons name={item.icon as any} size={24} color="#FFF" />
      </View>
      <View style={styles.details}>
        <Text style={[styles.agentName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.agentRole, { color: item.color }]}>{item.role}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Select AI Agent</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={AGENT_OPTIONS}
        renderItem={renderAgent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    backgroundColor: '#FFF',
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
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


