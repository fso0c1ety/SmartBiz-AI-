import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components/Card';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useToastStore } from '../store/useToastStore';
import { getGeneratedContent, postToSocialMedia, updateContentMedia } from '../services/agentService';
import { cacheMediaForContent, getCachedMediaForContent } from '../store/useMediaCache';
import { loadFeedCache, saveFeedCache } from '../store/usePersistentCache';

type ContentFeedScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ContentFeed'>;
};

interface GeneratedContent {
  id: string;
  agentId: string;
  agentName: string;
  type: 'post' | 'caption' | 'email' | 'blog' | 'ad' | 'code' | 'image';
  platform?: 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'linkedin';
  content: string;
  subject?: string;
  body?: string;
  media?: string[];
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

export const ContentFeedScreen: React.FC<ContentFeedScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { showToast } = useToastStore();

  const [filter, setFilter] = useState<'all' | 'caption' | 'email' | 'blog' | 'ad' | 'code' | 'image'>('all');
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Try local cache first for instant display
    (async () => {
      const cached = await loadFeedCache();
      if (cached && cached.length) setContents(cached);
      await loadContent();
    })();
  }, [filter]);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const data = await getGeneratedContent({
        type: filter === 'all' ? undefined : filter,
        limit: 50,
      });
      let normalized = Array.isArray(data) ? data : data?.contents || [];
      // Remove posts entirely from view
      normalized = normalized.filter((c: GeneratedContent) => c.type !== 'post');
      // Cache media locally so images persist within app and push to backend
      const withCachedMedia = await Promise.all(
        normalized.map(async (c: GeneratedContent) => {
          try {
            if (c.media && c.media.length > 0) {
              const normalize = (m: any) => {
                const v = typeof m === 'string' ? m : (m?.base64 || m?.url);
                if (!v) return null;
                const isHttp = /^https?:\/\//i.test(v);
                const isData = /^data:image\//i.test(v);
                if (isHttp || isData) return v;
                // Raw base64 without data URI: assume PNG
                return `data:image/png;base64,${v}`;
              };
              const normalizedMedia = (c.media || []).map(normalize).filter(Boolean) as string[];
              console.log(`📸 Caching media for content ${c.id}:`, normalizedMedia);
              const existing = await getCachedMediaForContent(c.id);
              const uris = existing || await cacheMediaForContent(c.id, normalizedMedia);
              console.log(`📸 Cached URIs for ${c.id}:`, uris);
              // try to persist URIs on backend for stable reloads
              try { await updateContentMedia({ contentId: c.id, media: uris }); }
              catch (e: any) {
                console.warn('⚠️ Failed to persist content media:', e?.message || e);
                showToast('Saved locally; backend media persistence failed.', 'warning');
              }
              return { ...c, media: uris } as GeneratedContent;
            }
            // Fallback: if imageUrl exists but media is empty, treat it as media
            // @ts-ignore
            if ((c as any).imageUrl) {
              const uri = (c as any).imageUrl as string;
              console.log(`📸 Fallback caching imageUrl for content ${c.id}:`, uri);
              const uris = await cacheMediaForContent(c.id, [uri]);
              console.log(`📸 Fallback cached URIs for ${c.id}:`, uris);
              try { await updateContentMedia({ contentId: c.id, media: uris }); } catch {}
              return { ...c, media: uris } as GeneratedContent;
            }
          } catch {}
          return c;
        })
      );
      console.log('📊 Content data received:', data);
      console.log('📊 Normalized contents:', withCachedMedia);
      setContents(withCachedMedia);
      // Save for persistence across reloads
      try { await saveFeedCache(withCachedMedia); } catch {}
    } catch (error: any) {
      console.error('❌ Load content error:', error);
      showToast(error.message || 'Failed to load content', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadContent();
    setIsRefreshing(false);
  };

  const handlePublish = async (content: GeneratedContent) => {
    if (!content.platform) {
      showToast('No platform selected', 'error');
      return;
    }

    try {
      await postToSocialMedia({
        agentId: content.agentId,
        platform: content.platform,
        content: content.content,
        media: content.media,
      });
      showToast('✅ Published successfully!', 'success');
      loadContent();
    } catch (error: any) {
      showToast(error.message || 'Failed to publish', 'error');
    }
  };

  const renderContentCard = (item: GeneratedContent) => {
    const getPlatformIcon = () => {
      switch (item.platform) {
        case 'instagram':
          return 'logo-instagram';
        case 'tiktok':
          return 'logo-tiktok';
        case 'twitter':
          return 'logo-twitter';
        case 'facebook':
          return 'logo-facebook';
        case 'linkedin':
          return 'logo-linkedin';
        default:
          return 'document-text';
      }
    };

    const getPlatformColor = () => {
      switch (item.platform) {
        case 'instagram':
          return '#E1306C';
        case 'tiktok':
          return '#000000';
        case 'twitter':
          return '#1DA1F2';
        case 'facebook':
          return '#4267B2';
        case 'linkedin':
          return '#0077B5';
        default:
          return colors.primary;
      }
    };

    const getStatusColor = () => {
      switch (item.status) {
        case 'published':
          return '#10B981';
        case 'scheduled':
          return '#F59E0B';
        default:
          return colors.textSecondary;
      }
    };

    return (
      <Card key={item.id} style={styles.contentCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.agentInfo}>
            <View
              style={[
                styles.platformIcon,
                { backgroundColor: getPlatformColor() + '20' },
              ]}
            >
              <Ionicons
                name={getPlatformIcon() as any}
                size={20}
                color={getPlatformColor()}
              />
            </View>
            <View>
              <Text style={[styles.agentName, { color: colors.text }]}>
                {item.agentName}
              </Text>
              <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                {new Date(item.createdAt).toLocaleDateString()} •{' '}
                {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Content */}
        {item.type === 'email' ? (
          <View style={{ gap: Spacing.sm }}>
            {item.subject && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Subject</Text>
                <Text style={[styles.contentText, { color: colors.text }]}>{item.subject}</Text>
              </View>
            )}
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Body</Text>
              <Text style={[styles.contentText, { color: colors.text }]}>{item.body || item.content}</Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.contentText, { color: colors.text }]}>
            {item.content}
          </Text>
        )}

        {/* Media */}
        {item.media && item.media.length > 0 && (
          item.media.length > 1 ? (
            <View style={styles.mediaGrid}>
              {item.media.map((m, idx) => {
                return (
                  <Image key={idx} source={{ uri: m }} style={styles.mediaGridImage} resizeMode="contain" onError={() => console.log('Image load error for:', m)} />
                );
              })}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.mediaScroll}
            >
              {item.media.map((m, idx) => {
                return (
                  <Image key={idx} source={{ uri: m }} style={styles.mediaImageLarge} resizeMode="contain" onError={() => console.log('Image load error for:', m)} />
                );
              })}
            </ScrollView>
          )
        )}

        {/* Engagement */}
        {item.engagement && item.status === 'published' && (
          <View style={styles.engagement}>
            {item.engagement.likes && (
              <View style={styles.engagementItem}>
                <Ionicons name="heart" size={16} color="#E1306C" />
                <Text style={[styles.engagementText, { color: colors.textSecondary }]}>
                  {item.engagement.likes}
                </Text>
              </View>
            )}
            {item.engagement.comments && (
              <View style={styles.engagementItem}>
                <Ionicons name="chatbubble" size={16} color="#1DA1F2" />
                <Text style={[styles.engagementText, { color: colors.textSecondary }]}>
                  {item.engagement.comments}
                </Text>
              </View>
            )}
            {item.engagement.shares && (
              <View style={styles.engagementItem}>
                <Ionicons name="share-social" size={16} color="#10B981" />
                <Text style={[styles.engagementText, { color: colors.textSecondary }]}>
                  {item.engagement.shares}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        {(item.status === 'draft' || item.type === 'image') && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.border }]}
            >
              <Ionicons name="pencil" size={18} color={colors.textSecondary} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                Edit
              </Text>
            </TouchableOpacity>
            {item.media && item.media.length > 0 && (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.border }]}
                onPress={async () => {
                  if (!item.media || item.media.length === 0) return;
                  try {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status !== 'granted') {
                      showToast('Permission required to save images', 'error');
                      return;
                    }
                    // Save first image in the set
                    const uri = item.media[0];
                    if (!uri) {
                      showToast('No image to save', 'error');
                      return;
                    }
                    let fileUri = uri;
                    if (uri.startsWith('data:image')) {
                      // Write base64 to a temp file
                      const ext = uri.includes('image/png') ? 'png' : 'jpg';
                      const path = FileSystem.documentDirectory + `smartbiz_${Date.now()}.${ext}`;
                      const base64Data = uri.split(',')[1];
                      await FileSystem.writeAsStringAsync(path, base64Data, { encoding: FileSystem.EncodingType.Base64 });
                      fileUri = path;
                    } else if (uri.startsWith('http')) {
                      // Download to temp file
                      const ext = 'jpg'; // assume
                      const path = FileSystem.documentDirectory + `smartbiz_${Date.now()}.${ext}`;
                      const download = await FileSystem.downloadAsync(uri, path);
                      fileUri = download.uri;
                    }
                    const asset = await MediaLibrary.createAssetAsync(fileUri);
                    await MediaLibrary.createAlbumAsync('SmartBiz AI', asset, false);
                    showToast('✅ Image saved to gallery', 'success');
                  } catch (e: any) {
                    console.error('Save image error:', e);
                    showToast(e.message || 'Failed to save image', 'error');
                  }
                }}
              >
                <Ionicons name="download" size={18} color={colors.textSecondary} />
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>Save Image</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.publishButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => handlePublish(item)}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.publishText}>Publish</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Content Feed
        </Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="filter" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {[
          { id: 'all', label: 'All', icon: 'grid' },
          { id: 'caption', label: 'Captions', icon: 'text' },
          { id: 'email', label: 'Emails', icon: 'mail' },
          { id: 'blog', label: 'Blogs', icon: 'document-text' },
          { id: 'ad', label: 'Ads', icon: 'megaphone' },
          { id: 'code', label: 'Code', icon: 'code-slash' },
          { id: 'image', label: 'Images', icon: 'image' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.filterTab,
              filter === (tab.id as any) && [
                styles.filterTabActive,
                { backgroundColor: colors.primary },
              ],
            ]}
            onPress={() => setFilter(tab.id as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={filter === (tab.id as any) ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.filterTabText,
                { color: filter === (tab.id as any) ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {contents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No content yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Your AI agents will generate content here
            </Text>
          </View>
        ) : (
          contents.map(renderContentCard)
        )}
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  headerAction: {
    padding: Spacing.xs,
  },
  filterContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  filterTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  contentCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  timestamp: {
    fontSize: FontSize.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
  contentText: {
    fontSize: FontSize.base,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  mediaScroll: {
    marginBottom: Spacing.md,
  },
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  mediaImageLarge: {
    width: 300,
    height: 300,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  mediaGridImage: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
  },
  engagement: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  engagementText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  publishButton: {
    borderWidth: 0,
  },
  publishText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
  },
});
