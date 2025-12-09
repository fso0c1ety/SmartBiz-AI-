import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useApi } from '../hooks/useApi';
import { useToastStore } from '../store/useToastStore';

type SetupBusinessScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const NICHE_OPTIONS = [
  { label: 'Marketing', icon: 'megaphone-outline' },
  { label: 'Email Marketing', icon: 'mail-outline' },
  { label: 'Social Media', icon: 'share-social-outline' },
  { label: 'Content Creation', icon: 'create-outline' },
  { label: 'Sales', icon: 'trending-up-outline' },
  { label: 'E-commerce', icon: 'cart-outline' },
  { label: 'Tech/Software', icon: 'code-outline' },
  { label: 'Consulting', icon: 'briefcase-outline' },
  { label: 'Education', icon: 'book-outline' },
  { label: 'Healthcare', icon: 'medical-outline' },
  { label: 'Finance', icon: 'wallet-outline' },
  { label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const BUDGET_OPTIONS = [
  'Under $1,000',
  '$1,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $50,000',
  'Over $50,000',
];

export const SetupBusinessScreen: React.FC<SetupBusinessScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { createBusiness } = useApi();
  const showToast = useToastStore((state) => state.showToast);

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const pickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setLogoUri(result.assets[0].uri);
        showToast('Logo selected', 'success');
      }
    } catch (error) {
      showToast('Failed to pick image', 'error');
    }
  };

  const steps = [
    { title: 'Business Info', icon: 'briefcase-outline' },
    { title: 'Industry', icon: 'grid-outline' },
    { title: 'Budget', icon: 'wallet-outline' },
    { title: 'Team', icon: 'people-outline' },
  ];

  const handleContinue = async () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 0 && !businessName.trim()) {
        showToast('Please enter your business name', 'warning');
        return;
      }
      if (currentStep === 1 && !selectedNiche) {
        showToast('Please select your industry', 'warning');
        return;
      }
      if (currentStep === 2 && !selectedBudget) {
        showToast('Please select your budget', 'warning');
        return;
      }
      setCurrentStep(currentStep + 1);
    } else {
      if (!businessName.trim()) {
        showToast('Please enter your business name', 'warning');
        return;
      }
      if (!selectedNiche) {
        showToast('Please select your business niche', 'warning');
        return;
      }
      if (!selectedBudget) {
        showToast('Please select your budget range', 'warning');
        return;
      }

      setIsLoading(true);
      try {
        const newBusiness = await createBusiness({
          name: businessName.trim(),
          industry: selectedNiche,
          description: description.trim() || 'Not provided',
          targetAudience: targetAudience.trim() || 'Not provided',
          goals: teamSize ? [`Team size: ${teamSize}`] : [],
          brandTone: 'professional',
        });

        showToast('Business setup complete!', 'success');
        navigation.navigate('SelectAgent', { businessId: newBusiness.id });
      } catch (error: any) {
        showToast(error.message || 'Failed to create business', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        Step {currentStep + 1} of {steps.length}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Setup Business
        </Text>
        <View style={styles.backBtn} />
      </View>

      {/* Progress bar */}
      {renderProgressBar()}

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentStep === 0 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Business Logo (Optional)
            </Text>
            <TouchableOpacity
              onPress={pickLogo}
              style={[styles.logoUploader, { backgroundColor: colors.surface }]}
            >
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
                  <Text style={[styles.logoText, { color: colors.textSecondary }]}>
                    Tap to upload logo
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={[styles.stepTitle, { color: colors.text, marginTop: Spacing.lg }]}>
              Business Name
            </Text>
            <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Tech Startup Inc"
                placeholderTextColor={colors.textTertiary}
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>

            <Text style={[styles.stepTitle, { color: colors.text, marginTop: Spacing.lg }]}>
              Description (Optional)
            </Text>
            <View style={[styles.inputBox, { backgroundColor: colors.surface, minHeight: 120 }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="What does your business do?"
                placeholderTextColor={colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {currentStep === 1 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Select Industry
            </Text>
            <View style={styles.nicheGrid}>
              {NICHE_OPTIONS.map((niche) => (
                <TouchableOpacity
                  key={niche.label}
                  onPress={() => setSelectedNiche(niche.label)}
                  activeOpacity={0.7}
                  style={[
                    styles.nicheCard,
                    {
                      backgroundColor:
                        selectedNiche === niche.label ? colors.primary + '15' : colors.surface,
                      borderColor: selectedNiche === niche.label ? colors.primary : colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={niche.icon as any}
                    size={28}
                    color={selectedNiche === niche.label ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.nicheLabel,
                      {
                        color: selectedNiche === niche.label ? colors.primary : colors.text,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {niche.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Budget Range
            </Text>
            <View style={styles.budgetList}>
              {BUDGET_OPTIONS.map((budget, index) => (
                <TouchableOpacity
                  key={budget}
                  onPress={() => setSelectedBudget(budget)}
                  activeOpacity={0.7}
                  style={[
                    styles.budgetCard,
                    {
                      backgroundColor: selectedBudget === budget ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.budgetSelector,
                      {
                        borderColor: selectedBudget === budget ? colors.primary : colors.primary + '40',
                        backgroundColor:
                          selectedBudget === budget ? colors.primary + 'AA' : 'transparent',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.budgetLabel,
                      {
                        color: selectedBudget === budget ? '#fff' : colors.text,
                      },
                    ]}
                  >
                    {budget}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Team Size
            </Text>
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., 5, 10, 50"
                placeholderTextColor={colors.textSecondary}
                value={teamSize}
                onChangeText={setTeamSize}
                keyboardType="number-pad"
              />
            </View>

            <Text style={[styles.stepTitle, { color: colors.text, marginTop: Spacing.lg }]}>
              Target Audience (Optional)
            </Text>
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border, minHeight: 100 }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Who are your customers?"
                placeholderTextColor={colors.textSecondary}
                value={targetAudience}
                onChangeText={setTargetAudience}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer buttons */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TouchableOpacity
          disabled={currentStep === 0}
          onPress={() => setCurrentStep(currentStep - 1)}
          style={[styles.backBtn, { opacity: currentStep === 0 ? 0.4 : 1 }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Button
          title={
            isLoading
              ? 'Setting up...'
              : currentStep === steps.length - 1
              ? 'Create Business'
              : 'Next'
          }
          onPress={handleContinue}
          disabled={isLoading}
          style={{ flex: 1 }}
        />
      </View>
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
    paddingBottom: Spacing.md,
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
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  progressBar: {
    height: 3,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: 120,
  },
  stepTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  logoUploader: {
    borderRadius: BorderRadius.lg,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoText: {
    fontSize: FontSize.sm,
  },
  inputBox: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    fontSize: FontSize.base,
    minHeight: 44,
  },
  nicheGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  nicheCard: {
    width: '48%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  nicheLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  budgetList: {
    gap: Spacing.sm,
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  budgetSelector: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  budgetLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});
