import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
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

const BRAND_TONES = [
  'Professional',
  'Casual',
  'Friendly',
  'Authoritative',
  'Playful',
  'Inspiring',
];

const INDUSTRIES = [
  'E-commerce',
  'SaaS',
  'Consulting',
  'Healthcare',
  'Education',
  'Real Estate',
  'Finance',
  'Food & Beverage',
  'Fashion',
  'Technology',
  'Other',
];

const GOALS = [
  'Increase Sales',
  'Build Brand Awareness',
  'Grow Social Following',
  'Generate Leads',
  'Customer Engagement',
  'Content Creation',
];

export const CreateAgentScreen: React.FC<CreateAgentScreenProps> = ({
  navigation,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { addAgent } = useAgentStore();
  const { showToast } = useToastStore();
  const { createBusiness, createAgent } = useApi();
  const [isCreating, setIsCreating] = useState(false);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    description: '',
    targetAudience: '',
    brandTone: '',
    customTone: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
    },
    logo: '',
    primaryColor: '#2D6AFF',
    secondaryColor: '#10B981',
    goals: [] as string[],
    role: 'Marketing Assistant',
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      updateFormData('logo', result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const handleCreate = async () => {
    if (!formData.businessName || !formData.industry) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsCreating(true);
    try {
        // Prepare business data, excluding empty/invalid fields
        const businessData: any = {
          name: formData.businessName,
          industry: formData.industry,
        };

        if (formData.description) {
          businessData.description = formData.description;
        }

        if (formData.targetAudience) {
          businessData.targetAudience = formData.targetAudience;
        }

        if (formData.brandTone || formData.customTone) {
          businessData.brandTone = formData.brandTone || formData.customTone;
        }

        // Only include socialLinks if at least one is filled
        const filledSocialLinks = Object.entries(formData.socialLinks)
          .filter(([_, value]) => value && value.trim() !== '')
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
      
        if (Object.keys(filledSocialLinks).length > 0) {
          businessData.socialLinks = filledSocialLinks;
        }

        // Only include logoUrl if it's a valid URL (not a local file URI)
        if (formData.logo && (formData.logo.startsWith('http://') || formData.logo.startsWith('https://'))) {
          businessData.logoUrl = formData.logo;
        }

        if (formData.primaryColor || formData.secondaryColor) {
          businessData.brandColors = {
            primary: formData.primaryColor,
            secondary: formData.secondaryColor,
          };
        }

        if (formData.goals && formData.goals.length > 0) {
          businessData.goals = formData.goals;
        }

        // Create business first
        const business = await createBusiness(businessData);

      // Create agent for the business
      const agent = await createAgent(business.id, formData.role || 'AI Marketing Manager');

      // Store in local state for UI
      const newAgent = {
        id: agent.id,
        businessName: business.name,
        industry: business.industry,
        description: business.description,
        targetAudience: business.targetAudience,
        brandTone: business.brandTone,
        socialLinks: formData.socialLinks,
          logo: business.logoUrl || formData.logo,
        brandColors: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor,
        },
        goals: formData.goals,
        role: formData.role,
        createdAt: new Date(agent.createdAt),
      };

      addAgent(newAgent);
      showToast('AI Employee created successfully!', 'success');
      navigation.navigate('Home');
    } catch (error: any) {
      console.error('Failed to create agent:', error);
      showToast(error.response?.data?.error || 'Failed to create agent', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Basic Information
      </Text>

      <Input
        label="Business Name *"
        placeholder="e.g., My Coffee Shop"
        value={formData.businessName}
        onChangeText={(text) => updateFormData('businessName', text)}
      />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Industry *</Text>
        <View style={styles.chipContainer}>
          {INDUSTRIES.map((industry) => (
            <TouchableOpacity
              key={industry}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    formData.industry === industry ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => updateFormData('industry', industry)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      formData.industry === industry ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {industry}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Business Description"
        placeholder="Tell us about your business"
        value={formData.description}
        onChangeText={(text) => updateFormData('description', text)}
        multiline
        numberOfLines={4}
        style={{ height: 100, textAlignVertical: 'top' }}
      />

      <Input
        label="Target Audience"
        placeholder="Who are your customers?"
        value={formData.targetAudience}
        onChangeText={(text) => updateFormData('targetAudience', text)}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Brand Identity
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Brand Tone</Text>
        <View style={styles.chipContainer}>
          {BRAND_TONES.map((tone) => (
            <TouchableOpacity
              key={tone}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    formData.brandTone === tone ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => updateFormData('brandTone', tone)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: formData.brandTone === tone ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {tone}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Custom Brand Tone (Optional)"
        placeholder="Describe your unique brand voice"
        value={formData.customTone}
        onChangeText={(text) => updateFormData('customTone', text)}
      />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Logo</Text>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.surface }]}
          onPress={pickImage}
        >
          {formData.logo ? (
            <View style={styles.logoPreview}>
              <Text style={[styles.uploadText, { color: colors.primary }]}>
                Logo uploaded ✓
              </Text>
            </View>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
              <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                Upload Logo
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.colorRow}>
        <View style={styles.colorGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Primary Color</Text>
          <View
            style={[
              styles.colorBox,
              { backgroundColor: formData.primaryColor },
            ]}
          />
        </View>
        <View style={styles.colorGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Secondary Color</Text>
          <View
            style={[
              styles.colorBox,
              { backgroundColor: formData.secondaryColor },
            ]}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Social Media Links
      </Text>

      <Input
        label="Instagram"
        placeholder="@username"
        value={formData.socialLinks.instagram}
        onChangeText={(text) => updateSocialLink('instagram', text)}
        icon="logo-instagram"
      />

      <Input
        label="Facebook"
        placeholder="Facebook page URL"
        value={formData.socialLinks.facebook}
        onChangeText={(text) => updateSocialLink('facebook', text)}
        icon="logo-facebook"
      />

      <Input
        label="Twitter"
        placeholder="@username"
        value={formData.socialLinks.twitter}
        onChangeText={(text) => updateSocialLink('twitter', text)}
        icon="logo-twitter"
      />

      <Input
        label="LinkedIn"
        placeholder="LinkedIn profile URL"
        value={formData.socialLinks.linkedin}
        onChangeText={(text) => updateSocialLink('linkedin', text)}
        icon="logo-linkedin"
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Goals & Objectives
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          What are your goals?
        </Text>
        <View style={styles.chipContainer}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.chip,
                {
                  backgroundColor: formData.goals.includes(goal)
                    ? colors.primary
                    : colors.surface,
                },
              ]}
              onPress={() => toggleGoal(goal)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: formData.goals.includes(goal) ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Agent Role"
        placeholder="e.g., Marketing Assistant"
        value={formData.role}
        onChangeText={(text) => updateFormData('role', text)}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i <= step ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        <View style={styles.footer}>
          {step < 4 ? (
            <Button title="Next" onPress={handleNext} fullWidth size="large" />
          ) : (
            <Button
              title={isCreating ? "Creating..." : "Create AI Employee"}
              onPress={handleCreate}
              fullWidth
              size="large"
              disabled={isCreating}
            />
          )}
        </View>
      </KeyboardAvoidingView>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  stepContent: {
    paddingTop: Spacing.lg,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  uploadButton: {
    height: 120,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  uploadText: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  logoPreview: {
    alignItems: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  colorGroup: {
    flex: 1,
  },
  colorBox: {
    height: 50,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
