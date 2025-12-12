import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useToastStore } from '../store/useToastStore';
import { AGENT_TYPES, AgentType } from '../types/agentTypes';
import { createEnhancedAgent, CreateEnhancedAgentPayload } from '../services/agentService';

type EnhancedCreateAgentScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const EnhancedCreateAgentScreen: React.FC<EnhancedCreateAgentScreenProps> = ({
  navigation,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { showToast } = useToastStore();

  const [step, setStep] = useState<'type' | 'basic' | 'specific' | 'review'>('type');
  const [selectedType, setSelectedType] = useState<AgentType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Basic info (all agents)
  const [basicInfo, setBasicInfo] = useState({
    businessName: '',
    industry: '',
    description: '',
    targetAudience: '',
    brandTone: 'Professional',
  });

  // Marketing-specific
  const [marketingConfig, setMarketingConfig] = useState({
    instagram: { username: '', autoPost: false },
    tiktok: { username: '', autoPost: false },
    twitter: { username: '', autoPost: false },
    facebook: { pageId: '', autoPost: false },
    linkedin: { profileId: '', autoPost: false },
    postingFrequency: 'daily' as 'daily' | 'twice-daily' | 'weekly',
    contentTypes: [] as string[],
  });

  // Sales-specific
  const [salesConfig, setSalesConfig] = useState({
    targetMarket: '',
    productService: '',
    priceRange: '',
    idealCustomer: '',
    leadSources: [] as string[],
    emailTemplate: '',
  });

  // Support-specific
  const [supportConfig, setSupportConfig] = useState({
    gmailEmail: '',
    gmailAutoReply: false,
    outlookEmail: '',
    outlookAutoReply: false,
    supportCategories: [] as string[],
    responseTime: '1hour' as 'immediate' | '1hour' | '24hours',
  });

  // Content-specific
  const [contentConfig, setContentConfig] = useState({
    contentTypes: [] as string[],
    writingStyle: 'Professional',
    seoKeywords: '',
    targetPlatforms: [] as string[],
    contentLength: 'medium' as 'short' | 'medium' | 'long',
  });

  const renderTypeSelection = () => (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>Choose Your AI Agent</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Select the type of AI employee you want to create
      </Text>

      <View style={styles.typeGrid}>
        {AGENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              { backgroundColor: colors.surface },
              selectedType === type.id && {
                borderColor: type.color,
                borderWidth: 3,
              },
            ]}
            onPress={() => setSelectedType(type.id as AgentType)}
          >
            <LinearGradient
              colors={[type.color + '20', type.color + '10']}
              style={styles.typeIconContainer}
            >
              <Ionicons name={type.icon as any} size={32} color={type.color} />
            </LinearGradient>
            <Text style={[styles.typeName, { color: colors.text }]}>{type.name}</Text>
            <Text style={[styles.typeDescription, { color: colors.textSecondary }]}>
              {type.description}
            </Text>
            <View style={styles.capabilitiesList}>
              {type.capabilities.slice(0, 2).map((cap, idx) => (
                <View key={idx} style={styles.capabilityItem}>
                  <Ionicons name="checkmark-circle" size={14} color={type.color} />
                  <Text style={[styles.capabilityText, { color: colors.textSecondary }]}>
                    {cap}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Continue"
        onPress={() => setStep('basic')}
        disabled={!selectedType}
        fullWidth
        style={styles.button}
      />
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>Business Information</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Tell us about your business
      </Text>

      <Input
        label="Business Name *"
        placeholder="Enter your business name"
        value={basicInfo.businessName}
        onChangeText={(text) => setBasicInfo({ ...basicInfo, businessName: text })}
        icon="business"
      />

      <Input
        label="Industry *"
        placeholder="e.g., E-commerce, SaaS, Healthcare"
        value={basicInfo.industry}
        onChangeText={(text) => setBasicInfo({ ...basicInfo, industry: text })}
        icon="briefcase"
      />

      <Input
        label="Description"
        placeholder="Brief description of your business"
        value={basicInfo.description}
        onChangeText={(text) => setBasicInfo({ ...basicInfo, description: text })}
        multiline
        numberOfLines={3}
      />

      <Input
        label="Target Audience"
        placeholder="Who are your customers?"
        value={basicInfo.targetAudience}
        onChangeText={(text) => setBasicInfo({ ...basicInfo, targetAudience: text })}
        icon="people"
      />

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep('type')}
          variant="outline"
          style={styles.halfButton}
        />
        <Button
          title="Continue"
          onPress={() => setStep('specific')}
          disabled={!basicInfo.businessName || !basicInfo.industry}
          style={styles.halfButton}
        />
      </View>
    </View>
  );

  const renderMarketingSpecific = () => (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>Social Media Accounts</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Connect your social media for automated posting
      </Text>

      {/* Instagram */}
      <Card style={styles.socialCard}>
        <View style={styles.socialHeader}>
          <View style={styles.socialInfo}>
            <Ionicons name="logo-instagram" size={24} color="#E1306C" />
            <Text style={[styles.socialName, { color: colors.text }]}>Instagram</Text>
          </View>
          <Switch
            value={marketingConfig.instagram.autoPost}
            onValueChange={(value) =>
              setMarketingConfig({
                ...marketingConfig,
                instagram: { ...marketingConfig.instagram, autoPost: value },
              })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        {marketingConfig.instagram.autoPost && (
          <Input
            placeholder="@username"
            value={marketingConfig.instagram.username}
            onChangeText={(text) =>
              setMarketingConfig({
                ...marketingConfig,
                instagram: { ...marketingConfig.instagram, username: text },
              })
            }
          />
        )}
      </Card>

      {/* TikTok */}
      <Card style={styles.socialCard}>
        <View style={styles.socialHeader}>
          <View style={styles.socialInfo}>
            <Ionicons name="logo-tiktok" size={24} color="#000000" />
            <Text style={[styles.socialName, { color: colors.text }]}>TikTok</Text>
          </View>
          <Switch
            value={marketingConfig.tiktok.autoPost}
            onValueChange={(value) =>
              setMarketingConfig({
                ...marketingConfig,
                tiktok: { ...marketingConfig.tiktok, autoPost: value },
              })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        {marketingConfig.tiktok.autoPost && (
          <Input
            placeholder="@username"
            value={marketingConfig.tiktok.username}
            onChangeText={(text) =>
              setMarketingConfig({
                ...marketingConfig,
                tiktok: { ...marketingConfig.tiktok, username: text },
              })
            }
          />
        )}
      </Card>

      {/* Twitter */}
      <Card style={styles.socialCard}>
        <View style={styles.socialHeader}>
          <View style={styles.socialInfo}>
            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            <Text style={[styles.socialName, { color: colors.text }]}>Twitter/X</Text>
          </View>
          <Switch
            value={marketingConfig.twitter.autoPost}
            onValueChange={(value) =>
              setMarketingConfig({
                ...marketingConfig,
                twitter: { ...marketingConfig.twitter, autoPost: value },
              })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        {marketingConfig.twitter.autoPost && (
          <Input
            placeholder="@username"
            value={marketingConfig.twitter.username}
            onChangeText={(text) =>
              setMarketingConfig({
                ...marketingConfig,
                twitter: { ...marketingConfig.twitter, username: text },
              })
            }
          />
        )}
      </Card>

      <Text style={[styles.sectionLabel, { color: colors.text }]}>Posting Schedule</Text>
      <View style={styles.optionsRow}>
        {['daily', 'twice-daily', 'weekly'].map((freq) => (
          <TouchableOpacity
            key={freq}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  marketingConfig.postingFrequency === freq
                    ? colors.primary
                    : colors.surface,
              },
            ]}
            onPress={() =>
              setMarketingConfig({
                ...marketingConfig,
                postingFrequency: freq as any,
              })
            }
          >
            <Text
              style={[
                styles.optionText,
                {
                  color:
                    marketingConfig.postingFrequency === freq
                      ? '#FFFFFF'
                      : colors.textSecondary,
                },
              ]}
            >
              {freq.replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep('basic')}
          variant="outline"
          style={styles.halfButton}
        />
        <Button
          title="Create Agent"
          onPress={handleCreate}
          isLoading={isCreating}
          style={styles.halfButton}
        />
      </View>
    </View>
  );

  const renderSalesSpecific = () => (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>Sales Configuration</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Configure your AI sales agent
      </Text>

      <Input
        label="Target Market *"
        placeholder="e.g., Small businesses in USA"
        value={salesConfig.targetMarket}
        onChangeText={(text) => setSalesConfig({ ...salesConfig, targetMarket: text })}
        icon="globe"
      />

      <Input
        label="Product/Service *"
        placeholder="What are you selling?"
        value={salesConfig.productService}
        onChangeText={(text) => setSalesConfig({ ...salesConfig, productService: text })}
        icon="cart"
      />

      <Input
        label="Price Range"
        placeholder="e.g., $99-$499/month"
        value={salesConfig.priceRange}
        onChangeText={(text) => setSalesConfig({ ...salesConfig, priceRange: text })}
        icon="cash"
      />

      <Input
        label="Ideal Customer Profile"
        placeholder="Describe your perfect customer"
        value={salesConfig.idealCustomer}
        onChangeText={(text) => setSalesConfig({ ...salesConfig, idealCustomer: text })}
        multiline
        numberOfLines={3}
      />

      <Input
        label="Outreach Email Template"
        placeholder="Hi {name}, I noticed..."
        value={salesConfig.emailTemplate}
        onChangeText={(text) => setSalesConfig({ ...salesConfig, emailTemplate: text })}
        multiline
        numberOfLines={4}
      />

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep('basic')}
          variant="outline"
          style={styles.halfButton}
        />
        <Button
          title="Create Agent"
          onPress={handleCreate}
          isLoading={isCreating}
          disabled={!salesConfig.targetMarket || !salesConfig.productService}
          style={styles.halfButton}
        />
      </View>
    </View>
  );

  const renderSupportSpecific = () => (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>Support Configuration</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Connect email accounts for automated support
      </Text>

      <Card style={styles.socialCard}>
        <View style={styles.socialHeader}>
          <View style={styles.socialInfo}>
            <Ionicons name="logo-google" size={24} color="#EA4335" />
            <Text style={[styles.socialName, { color: colors.text }]}>Gmail</Text>
          </View>
          <Switch
            value={supportConfig.gmailAutoReply}
            onValueChange={(value) =>
              setSupportConfig({ ...supportConfig, gmailAutoReply: value })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        {supportConfig.gmailAutoReply && (
          <>
            <Input
              placeholder="support@yourbusiness.com"
              value={supportConfig.gmailEmail}
              onChangeText={(text) =>
                setSupportConfig({ ...supportConfig, gmailEmail: text })
              }
              keyboardType="email-address"
            />
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              💡 You'll need to enable App Password in your Gmail settings
            </Text>
          </>
        )}
      </Card>

      <Card style={styles.socialCard}>
        <View style={styles.socialHeader}>
          <View style={styles.socialInfo}>
            <Ionicons name="mail" size={24} color="#0078D4" />
            <Text style={[styles.socialName, { color: colors.text }]}>Outlook</Text>
          </View>
          <Switch
            value={supportConfig.outlookAutoReply}
            onValueChange={(value) =>
              setSupportConfig({ ...supportConfig, outlookAutoReply: value })
            }
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        {supportConfig.outlookAutoReply && (
          <Input
            placeholder="support@yourbusiness.com"
            value={supportConfig.outlookEmail}
            onChangeText={(text) =>
              setSupportConfig({ ...supportConfig, outlookEmail: text })
            }
            keyboardType="email-address"
          />
        )}
      </Card>

      <Text style={[styles.sectionLabel, { color: colors.text }]}>Response Time</Text>
      <View style={styles.optionsRow}>
        {[
          { id: 'immediate', label: 'Immediate' },
          { id: '1hour', label: '1 Hour' },
          { id: '24hours', label: '24 Hours' },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  supportConfig.responseTime === option.id
                    ? colors.primary
                    : colors.surface,
              },
            ]}
            onPress={() =>
              setSupportConfig({
                ...supportConfig,
                responseTime: option.id as any,
              })
            }
          >
            <Text
              style={[
                styles.optionText,
                {
                  color:
                    supportConfig.responseTime === option.id
                      ? '#FFFFFF'
                      : colors.textSecondary,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep('basic')}
          variant="outline"
          style={styles.halfButton}
        />
        <Button
          title="Create Agent"
          onPress={handleCreate}
          isLoading={isCreating}
          disabled={!supportConfig.gmailAutoReply && !supportConfig.outlookAutoReply}
          style={styles.halfButton}
        />
      </View>
    </View>
  );

  const renderContentSpecific = () => (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>Content Configuration</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Configure your AI content writer
      </Text>

      <Input
        label="SEO Keywords"
        placeholder="Enter keywords separated by commas"
        value={contentConfig.seoKeywords}
        onChangeText={(text) => setContentConfig({ ...contentConfig, seoKeywords: text })}
        icon="search"
      />

      <Text style={[styles.sectionLabel, { color: colors.text }]}>Writing Style</Text>
      <View style={styles.optionsRow}>
        {['Professional', 'Casual', 'Technical', 'Creative'].map((style) => (
          <TouchableOpacity
            key={style}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  contentConfig.writingStyle === style ? colors.primary : colors.surface,
              },
            ]}
            onPress={() => setContentConfig({ ...contentConfig, writingStyle: style })}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color:
                    contentConfig.writingStyle === style
                      ? '#FFFFFF'
                      : colors.textSecondary,
                },
              ]}
            >
              {style}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.text }]}>Content Length</Text>
      <View style={styles.optionsRow}>
        {[
          { id: 'short', label: 'Short (300-500 words)' },
          { id: 'medium', label: 'Medium (800-1200)' },
          { id: 'long', label: 'Long (1500-2500)' },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionChip,
              {
                backgroundColor:
                  contentConfig.contentLength === option.id
                    ? colors.primary
                    : colors.surface,
              },
            ]}
            onPress={() =>
              setContentConfig({
                ...contentConfig,
                contentLength: option.id as any,
              })
            }
          >
            <Text
              style={[
                styles.optionText,
                {
                  color:
                    contentConfig.contentLength === option.id
                      ? '#FFFFFF'
                      : colors.textSecondary,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep('basic')}
          variant="outline"
          style={styles.halfButton}
        />
        <Button
          title="Create Agent"
          onPress={handleCreate}
          isLoading={isCreating}
          style={styles.halfButton}
        />
      </View>
    </View>
  );

  const renderSpecificConfig = () => {
    switch (selectedType) {
      case 'marketing':
        return renderMarketingSpecific();
      case 'sales':
        return renderSalesSpecific();
      case 'support':
        return renderSupportSpecific();
      case 'content':
        return renderContentSpecific();
      default:
        return null;
    }
  };

  const handleCreate = async () => {
    if (!selectedType) return;

    setIsCreating(true);
    try {
      // Build the payload based on agent type
      let config: any;
      switch (selectedType) {
        case 'marketing':
          config = {
            socialAccounts: {
              ...(marketingConfig.instagram.autoPost && {
                instagram: {
                  username: marketingConfig.instagram.username,
                  autoPost: true,
                },
              }),
              ...(marketingConfig.tiktok.autoPost && {
                tiktok: {
                  username: marketingConfig.tiktok.username,
                  autoPost: true,
                },
              }),
              ...(marketingConfig.twitter.autoPost && {
                twitter: {
                  username: marketingConfig.twitter.username,
                  autoPost: true,
                },
              }),
              ...(marketingConfig.facebook.autoPost && {
                facebook: {
                  pageId: marketingConfig.facebook.pageId,
                  autoPost: true,
                },
              }),
              ...(marketingConfig.linkedin.autoPost && {
                linkedin: {
                  profileId: marketingConfig.linkedin.profileId,
                  autoPost: true,
                },
              }),
            },
            postingFrequency: marketingConfig.postingFrequency,
            contentTypes: marketingConfig.contentTypes,
          };
          break;

        case 'sales':
          config = {
            targetMarket: salesConfig.targetMarket,
            productService: salesConfig.productService,
            priceRange: salesConfig.priceRange,
            idealCustomer: salesConfig.idealCustomer,
            leadSources: salesConfig.leadSources,
            emailTemplate: salesConfig.emailTemplate,
          };
          break;

        case 'support':
          config = {
            emailAccounts: {
              ...(supportConfig.gmailAutoReply && {
                gmail: {
                  email: supportConfig.gmailEmail,
                  autoReply: true,
                },
              }),
              ...(supportConfig.outlookAutoReply && {
                outlook: {
                  email: supportConfig.outlookEmail,
                  autoReply: true,
                },
              }),
            },
            supportCategories: supportConfig.supportCategories,
            responseTime: supportConfig.responseTime,
          };
          break;

        case 'content':
          config = {
            contentTypes: contentConfig.contentTypes,
            writingStyle: contentConfig.writingStyle,
            seoKeywords: contentConfig.seoKeywords,
            targetPlatforms: contentConfig.targetPlatforms,
            contentLength: contentConfig.contentLength,
          };
          break;
      }

      const payload: CreateEnhancedAgentPayload = {
        type: selectedType,
        basicInfo: {
          businessName: basicInfo.businessName,
          industry: basicInfo.industry,
          description: basicInfo.description,
          targetAudience: basicInfo.targetAudience,
          brandTone: basicInfo.brandTone,
        },
        config,
      };

      // Call backend API with DeepSeek integration
      await createEnhancedAgent(payload);

      showToast('🎉 AI Agent created successfully!', 'success');
      navigation.goBack();
    } catch (error: any) {
      showToast(error.message || 'Failed to create agent', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => (step === 'type' ? navigation.goBack() : setStep('type'))}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Create AI Agent
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  step === 'type' ? 25 : step === 'basic' ? 50 : step === 'specific' ? 75 : 100
                }%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'type' && renderTypeSelection()}
        {step === 'basic' && renderBasicInfo()}
        {step === 'specific' && renderSpecificConfig()}
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
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.base,
    marginBottom: Spacing.xl,
  },
  typeGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  typeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  typeName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  typeDescription: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  capabilitiesList: {
    gap: Spacing.xs,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  capabilityText: {
    fontSize: FontSize.xs,
  },
  socialCard: {
    marginBottom: Spacing.md,
  },
  socialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  socialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  socialName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  sectionLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  optionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
  helpText: {
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  halfButton: {
    flex: 1,
  },
  button: {
    marginTop: Spacing.md,
  },
});
