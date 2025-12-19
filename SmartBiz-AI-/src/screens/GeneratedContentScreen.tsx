import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore } from '../store/useAgentStore';
import { useToastStore } from '../store/useToastStore';
import { apiService } from '../services/api.service';

const { width } = Dimensions.get('window');

type GeneratedContentScreenProps = {
  navigation: any;
};

  id: string;
  type: string;
  title?: string;
  preview: string;
  agent: string;
  timestamp: string;
  icon: string;
  color: string;
  content?: string;
  media?: string[];
}

export const GeneratedContentScreen: React.FC<GeneratedContentScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { agents, selectedAgent } = useAgentStore();
  const { showToast } = useToastStore();
  const [generatedContent, setGeneratedContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filter, setFilter] = useState<'all' | 'post' | 'email' | 'ad' | 'blog'>('all');

  const contentTypes = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'post', label: 'Social Posts', icon: 'chatbubbles' },
    { id: 'email', label: 'Emails', icon: 'mail' },
    { id: 'ad', label: 'Ad Copy', icon: 'megaphone' },
    { id: 'blog', label: 'Articles', icon: 'document-text' },
  ];

  useEffect(() => {
    loadContent();
  }, [selectedAgent]);

  useFocusEffect(
    React.useCallback(() => {
      loadContent();
    }, [selectedAgent])
  );

  const loadContent = async () => {
    if (!selectedAgent?.id) return;
    try {
      setIsLoading(true);
      const content = await apiService.getAllContent(selectedAgent.id);
      
      const typeIcons: Record<string, string> = {
        post: 'logo-instagram',
        email: 'mail',
        ad: 'megaphone',
        blog: 'document-text',
        caption: 'text',
      };


      const mappedContent = content.map((item: any) => {
        let contentData;
        try {
          contentData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
        } catch (e) {
          console.error('Failed to parse content data:', e);
          contentData = { prompt: 'Content', content: item.data || '' };
        }
        const createdAt = new Date(item.createdAt);
        const timeAgo = getTimeAgo(createdAt);
        return {
          id: item.id,
          type: item.type,
          title: contentData.prompt || 'Generated Content',
          preview: (contentData.content || '').substring(0, 100) + '...',
          content: contentData.content,
          agent: selectedAgent.agentName,
          timestamp: timeAgo,
          icon: typeIcons[item.type] || 'document-text',
          color: colors.primary,
          media: Array.isArray(contentData.media) ? contentData.media : undefined,
        };
      });

      setGeneratedContent(mappedContent);
      setTotalCount(mappedContent.length);
    } catch (error: any) {
      console.error('Failed to load content:', error);
      showToast('Failed to load generated content', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadContent();
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const stats = [
    { label: 'Total Generated', value: totalCount.toString(), icon: 'document', color: colors.primary },
    { label: 'This Week', value: generatedContent.filter(c => {
      const date = new Date(c.timestamp);
      const weekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
      return date > weekAgo;
    }).length.toString(), icon: 'calendar', color: colors.success },
    { label: 'This Month', value: generatedContent.filter(c => {
      const date = new Date(c.timestamp);
      const monthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
      return date > monthAgo;
    }).length.toString(), icon: 'stats-chart', color: colors.accent },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Generated Content"
        subtitle={`${generatedContent.length} items`}
        notificationCount={0}
        showNotification={false}
        onSearchPress={() => {}}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {contentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === type.id ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setFilter(type.id as any)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={type.icon as any}
                size={16}
                color={filter === type.id ? '#fff' : colors.text}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: filter === type.id ? '#fff' : colors.text },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content List */}
        <View style={styles.contentList}>
          {isLoading ? (
            <View style={{ padding: Spacing.lg, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>Loading content...</Text>
            </View>
          ) : generatedContent.length === 0 ? (
            <View style={{ padding: Spacing.lg, alignItems: 'center' }}>
              <Ionicons name="document-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No generated content yet</Text>
              <Text style={{ color: colors.textSecondary, marginTop: Spacing.sm }}>Create your first content using the generator</Text>
            </View>
          ) : generatedContent
            .filter(item => filter === 'all' || item.type === filter)
            .map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.contentCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ContentGenerator')}
              >
                <Card>
                  <View style={styles.cardHeader}>
                    <View style={[styles.contentIcon, { backgroundColor: item.color + '20' }]}> 
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={[styles.contentTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.metaRow}>
                        <Badge text={item.agent} variant="default" />
                        <Text style={[styles.timestamp, { color: colors.textSecondary }]}> 
                          • {item.timestamp}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                      <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Show preview text */}
                  <Text style={[styles.contentPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.preview}
                  </Text>

                  {/* Show images if present */}
                  {item.media && item.media.length > 0 && (
                    <ScrollView horizontal style={{ marginBottom: 12 }}>
                      {item.media.map((uri, idx) => (
                        <Image
                          key={idx}
                          source={{ uri }}
                          style={{ width: 120, height: 120, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' }}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="eye-outline" size={18} color={colors.primary} />
                      <Text style={[styles.actionText, { color: colors.primary }]}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="copy-outline" size={18} color={colors.primary} />
                      <Text style={[styles.actionText, { color: colors.primary }]}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-outline" size={18} color={colors.primary} />
                      <Text style={[styles.actionText, { color: colors.primary }]}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
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
    paddingBottom: Spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  filterContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  contentList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  contentCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  contentIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  contentTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timestamp: {
    fontSize: FontSize.xs,
  },
  moreButton: {
    padding: Spacing.xs,
  },
  contentPreview: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  createNewButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  createNewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  createNewText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
