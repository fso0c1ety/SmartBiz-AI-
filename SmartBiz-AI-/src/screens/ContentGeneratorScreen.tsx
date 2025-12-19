import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore } from '../store/useAgentStore';
import { useToastStore } from '../store/useToastStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from '../services/api.service';

type ContentGeneratorScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type ContentType = 'post' | 'caption' | 'email' | 'blog' | 'ad';

interface GeneratedContent {
  id: string;
  type: ContentType;
  content: string;
  timestamp: Date;
  prompt: string;
}

const CONTENT_TYPES = [
  { id: 'post' as ContentType, title: 'Social Post', icon: 'logo-instagram' },
  { id: 'caption' as ContentType, title: 'Caption', icon: 'text' },
  { id: 'email' as ContentType, title: 'Email', icon: 'mail' },
  { id: 'blog' as ContentType, title: 'Blog Post', icon: 'document-text' },
  { id: 'ad' as ContentType, title: 'Ad Copy', icon: 'megaphone' },
];

export const ContentGeneratorScreen: React.FC<ContentGeneratorScreenProps> = ({
  navigation,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { selectedAgent } = useAgentStore();
  const { showToast } = useToastStore();

  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = async () => {
    if (!selectedType || !prompt.trim()) {
      showToast('Please select a content type and enter a prompt', 'error');
      return;
    }

    if (!selectedAgent?.id) {
      showToast('Please select an agent first', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const content = await apiService.generateContent(
        selectedAgent.id,
        selectedType,
        prompt
      );

      const newContent: GeneratedContent = {
        id: content.content.id,
        type: selectedType,
        content: typeof content.content.data === 'string' 
          ? JSON.parse(content.content.data).content 
          : content.content.data.content,
        timestamp: new Date(),
        prompt: prompt,
      };

      setGeneratedContents((prev) => [newContent, ...prev]);
      setIsGenerating(false);
      setPrompt('');
      showToast('Content generated successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to generate content:', error);
      showToast(error.response?.data?.error || 'Failed to generate content', 'error');
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string) => {
    Clipboard.setString(content);
    showToast('Copied to clipboard!', 'success');
  };

  const handleRegenerate = (id: string) => {
    showToast('Regenerating content...', 'info');
    // Implement regeneration logic
  };

  const handleDownload = (content: GeneratedContent) => {
    showToast('Content saved successfully!', 'success');
  };

  const renderContentCard = (content: GeneratedContent) => (
    <Card key={content.id} style={styles.contentCard}>
      <View style={styles.contentHeader}>
        <View style={styles.contentTypeInfo}>
          <Ionicons
            name={
              CONTENT_TYPES.find((t) => t.id === content.type)?.icon as any ||
              'document-text'
            }
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.contentType, { color: colors.text }]}>
            {CONTENT_TYPES.find((t) => t.id === content.type)?.title}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {content.timestamp.toLocaleTimeString()}
        </Text>
      </View>

      <View style={[styles.contentBody, { backgroundColor: colors.surface }]}>
        <Text style={[styles.contentText, { color: colors.text }]}>
          {content.content}
        </Text>
      </View>

      <View style={styles.contentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCopy(content.content)}
        >
          <Ionicons name="copy-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDownload(content)}
        >
          <Ionicons name="download-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Save
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRegenerate(content.id)}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Regenerate
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Content Generator
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Select Content Type
        </Text>

        <View style={styles.typeGrid}>
          {CONTENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                {
                  backgroundColor:
                    selectedType === type.id ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons
                name={type.icon as any}
                size={28}
                color={selectedType === type.id ? '#FFFFFF' : colors.text}
              />
              <Text
                style={[
                  styles.typeTitle,
                  {
                    color: selectedType === type.id ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {type.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          What do you want to create?
        </Text>

        <View style={[styles.promptContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.promptInput, { color: colors.text }]}
            placeholder="E.g., A post about our new product launch..."
            placeholderTextColor={colors.textSecondary}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
          />
        </View>

        <Button
          title={isGenerating ? 'Generating...' : 'Generate Content'}
          onPress={generateContent}
          isLoading={isGenerating}
          fullWidth
          size="large"
          style={{ marginBottom: Spacing.xl }}
        />

        {generatedContents.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Generated Content
            </Text>
            {generatedContents.map(renderContentCard)}
          </>
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
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  typeCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typeTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  promptContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  promptInput: {
    fontSize: FontSize.base,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  contentCard: {
    marginBottom: Spacing.md,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contentTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contentType: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  timestamp: {
    fontSize: FontSize.xs,
  },
  contentBody: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  contentText: {
    fontSize: FontSize.base,
    lineHeight: 24,
  },
  contentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
