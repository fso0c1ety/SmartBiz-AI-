import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { GradientCard } from '../components/GradientCard';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Hero Section */}
            <View style={styles.hero}>
            <View style={styles.logoSection}>
              <View style={[styles.logoOuter, { borderColor: colors.gradient1 }]}> 
                <Image source={require('../../assets/new-icon.png')} style={styles.logoImage} />
              </View>
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>SmartBiz AI</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI-powered business, reimagined</Text>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <StatItem number="24/7" label="Uptime" colors={colors} />
            <StatItem number="∞" label="Scalable" colors={colors} />
            <StatItem number="✨" label="AI Magic" colors={colors} />
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <GradientCard colors={[colors.gradient1, colors.gradient2, colors.gradient3]} style={styles.featureCard}>
              <Ionicons name="rocket" size={32} color="#FFFFFF" />
              <Text style={styles.featureCardTitle}>AI-Powered</Text>
              <Text style={styles.featureCardDesc}>
                Advanced AI creates custom agents for your business
              </Text>
            </GradientCard>
            <GradientCard colors={[colors.gradient2, colors.gradient3, colors.gradient1]} style={styles.featureCard}>
              <Ionicons name="flash" size={32} color="#FFFFFF" />
              <Text style={styles.featureCardTitle}>Instant Setup</Text>
              <Text style={styles.featureCardDesc}>
                Get started in minutes, not weeks
              </Text>
            </GradientCard>
          </View>

          {/* Detailed Features */}
          <View style={styles.features}>
            <FeatureItem
              icon="bulb"
              title="Smart Content Generation"
              description="Create posts, ads, and campaigns tailored to your brand"
              colors={colors}
            />
            <FeatureItem
              icon="analytics"
              title="Real-time Analytics"
              description="Track performance and get actionable insights"
              colors={colors}
            />
            <FeatureItem
              icon="people"
              title="Multiple AI Agents"
              description="Manage unlimited businesses with dedicated AI agents"
              colors={colors}
            />
            <FeatureItem
              icon="shield-checkmark"
              title="Secure & Private"
              description="Your business data is encrypted and protected"
              colors={colors}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* CTA Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <Button
          title="Start Free Trial"
          onPress={() => navigation.navigate('Register')}
          fullWidth
          size="large"
        />
        <Button
          title="Sign In"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          fullWidth
          style={{ marginTop: Spacing.sm }}
        />
      </View>
      </View>
    </SafeAreaView>
  );
};


interface StatItemProps {
  number: string;
  label: string;
  colors: typeof Colors.light;
}

const StatItem: React.FC<StatItemProps> = ({ number, label, colors }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statNumber, { color: colors.primary }]}>{number}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  colors: typeof Colors.light;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
  colors,
}) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '15' }]}>
      <Ionicons name={icon} size={24} color={colors.primary} />
    </View>
    <View style={styles.featureContent}>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl, // Space for content breathing room
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoSection: {
    marginBottom: Spacing.lg,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D6AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flex: 1,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  featureCardDesc: {
    fontSize: FontSize.xs,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 16,
  },
  features: {
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
