import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useApi } from '../hooks/useApi';
import { useToastStore } from '../store/useToastStore';
import type { AIAgent } from './SelectAgentScreen';

type AgentOnboardingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, 'AgentOnboarding'>;
};

export const AgentOnboardingScreen: React.FC<AgentOnboardingScreenProps> = ({
  navigation,
  route,
}) => {
  const agent: AIAgent = route.params.agent;
  const { colorScheme } = useThemeStore();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { createBusiness, createAgent } = useApi();
  const showToast = useToastStore((state) => state.showToast);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(agent.questions.length).fill(''));
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswerChange = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = text;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[currentQuestion].trim()) {
      showToast('Please answer the question', 'warning');
      return;
    }

    if (currentQuestion < agent.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = async () => {
    // Verify all questions are answered
    if (answers.some((answer) => !answer.trim())) {
      showToast('Please answer all questions', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // First, create a business with the onboarding information
      const businessData = {
        name: `${agent.name}'s Business`,
        industry: agent.niche,
        brandTone: 'professional',
        description: answers.join(' | '),
        targetAudience: answers[1] || '',
        goals: agent.questions.map((q, i) => `${q.text}: ${answers[i]}`),
      };

      const newBusiness = await createBusiness(businessData);

      // Then create the agent for that business
      const newAgent = await createAgent(newBusiness.id, agent.name);

      showToast(`${agent.name} is ready to help!`, 'success');
      // Use CommonActions to reset the navigation stack and go to Agents tab
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'MainTabs',
              state: {
                routes: [
                  { name: 'Agents' },
                ],
              },
            },
          ],
        })
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to create agent', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / agent.questions.length) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.agentIcon, { backgroundColor: agent.color + '20' }]}>
            <Ionicons name={agent.icon as any} size={24} color={agent.color} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{agent.name}</Text>
            <Text style={[styles.headerSubtitle, { color: agent.color }]}>{agent.role}</Text>
          </View>
        </View>

        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progress}%`,
              backgroundColor: agent.color,
            },
          ]}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepCount, { color: colors.textSecondary }]}>
          Question {currentQuestion + 1} of {agent.questions.length}
        </Text>

        <Text style={[styles.question, { color: colors.text }]}>
          {agent.questions[currentQuestion].text}
        </Text>

        {agent.questions[currentQuestion].type === 'choice' && agent.questions[currentQuestion].options ? (
          <View style={styles.optionsContainer}>
            {agent.questions[currentQuestion].options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswerChange(option)}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      answers[currentQuestion] === option ? agent.color : colors.surface,
                    borderColor: agent.color,
                    borderWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: answers[currentQuestion] === option ? '#fff' : colors.text,
                    },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Card style={[styles.inputCard, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
              placeholder="Type your answer here..."
              placeholderTextColor={colors.textSecondary}
              value={answers[currentQuestion]}
              onChangeText={handleAnswerChange}
              multiline
              numberOfLines={5}
            />
          </Card>
        )}

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {agent.name} will use your answers to customize their approach for your business.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={currentQuestion === 0}
          onPress={handlePrevious}
          style={[
            styles.backButton,
            {
              opacity: currentQuestion === 0 ? 0.5 : 1,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>

        {currentQuestion < agent.questions.length - 1 ? (
          <Button
            title="Next"
            onPress={handleNext}
            style={[styles.actionButton, { backgroundColor: agent.color }]}
          />
        ) : (
          <Button
            title={isLoading ? 'Creating...' : 'Get Started'}
            onPress={handleComplete}
            disabled={isLoading}
            style={[styles.actionButton, { backgroundColor: agent.color }]}
          />
        )}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    justifyContent: 'space-between',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  agentIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  stepCount: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
    fontWeight: FontWeight.semibold,
  },
  question: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
    lineHeight: 28,
  },
  input: {
    minHeight: 120,
    padding: Spacing.md,
    fontSize: FontSize.base,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  optionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  hint: {
    fontSize: FontSize.xs,
    marginTop: Spacing.md,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  footerButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  nextButton: {
    flex: 1,
  },
});
