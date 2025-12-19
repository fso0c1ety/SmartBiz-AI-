import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useToastStore } from '../store/useToastStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { showToast } = useToastStore();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showToast('Password reset link sent to your email', 'success');
      navigation.goBack();
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Forgot Password?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              error={error}
            />

            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              isLoading={isLoading}
              fullWidth
              size="large"
              style={{ marginTop: Spacing.lg }}
            />

            <Button
              title="Back to Login"
              onPress={() => navigation.goBack()}
              variant="ghost"
              fullWidth
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.base,
    lineHeight: 24,
  },
  form: {
    marginTop: Spacing.lg,
  },
});
