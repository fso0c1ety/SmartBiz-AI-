import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useAgentStore } from '../store/useAgentStore';
import { useApi } from '../hooks/useApi';
import { useToastStore } from '../store/useToastStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

type AgentWorkspaceScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const AgentWorkspaceScreen: React.FC<AgentWorkspaceScreenProps> = ({
  navigation,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { selectedAgent } = useAgentStore();
  const { sendMessage: sendApiMessage, getMessages } = useApi();
  const { showToast } = useToastStore();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingMessage, setTypingMessage] = useState<Message | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedAgent?.id) {
        loadMessages();
      }
    }, [selectedAgent?.id])
  );

  useEffect(() => {
    return () => {
      // Cleanup typing interval on unmount
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, []);

  const loadMessages = async () => {
    if (!selectedAgent?.id) return;

    setIsLoadingMessages(true);
    try {
      const apiMessages = await getMessages(selectedAgent.id);
      const formattedMessages: Message[] = apiMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedAgent?.id || isSendingMessage) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    const thinkingMessage: Message = {
      id: 'thinking-temp',
      text: '',
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setMessage('');
    setIsSendingMessage(true);

    // Clean up any existing typing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    try {
      const response = await sendApiMessage(selectedAgent.id, userMessage.text);

      // Remove thinking message
      setMessages((prev) => prev.filter(msg => msg.id !== 'thinking-temp'));

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        text: response.message,
        isUser: false,
        timestamp: new Date(),
      };

      // Add AI message and start typing animation
      setMessages((prev) => [...prev, aiMessage]);
      setTypingMessage(aiMessage);
      
      let displayIndex = 0;
      typingIntervalRef.current = setInterval(() => {
        if (displayIndex <= response.message.length) {
          setDisplayedText(response.message.substring(0, displayIndex));
          displayIndex++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setTypingMessage(null);
          setDisplayedText('');
        }
      }, 20);
    } catch (error: any) {
      setMessages((prev) => prev.filter(msg => msg.id !== 'thinking-temp'));
      showToast(error.message || 'Failed to send message', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const ThinkingDots = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const createAnimation = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.delay(400),
          ])
        );
      };

      const anim1 = createAnimation(dot1, 0);
      const anim2 = createAnimation(dot2, 200);
      const anim3 = createAnimation(dot3, 400);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    }, []);

    const getAnimatedStyle = (dot: Animated.Value) => ({
      opacity: dot.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
      transform: [
        {
          scale: dot.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
    });

    return (
      <View style={styles.thinkingContainer}>
        <Animated.View style={[
          styles.thinkingDot,
          { backgroundColor: colors.textSecondary },
          getAnimatedStyle(dot1),
        ]} />
        <Animated.View style={[
          styles.thinkingDot,
          { backgroundColor: colors.textSecondary },
          getAnimatedStyle(dot2),
        ]} />
        <Animated.View style={[
          styles.thinkingDot,
          { backgroundColor: colors.textSecondary },
          getAnimatedStyle(dot3),
        ]} />
      </View>
    );
  };

  const BlinkingCursor = () => {
    const cursorOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => animation.stop();
    }, []);

    return (
      <Animated.View 
        style={[
          styles.typingCursor, 
          { 
            backgroundColor: colors.text,
            opacity: cursorOpacity,
          }
        ]} 
      />
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageRow,
        item.isUser ? styles.userMessageRow : styles.aiMessageRow,
      ]}
    >
      {!item.isUser && (
        <View style={[styles.aiAvatarSmall, { backgroundColor: colors.primary }]}>
          <Ionicons name="sparkles" size={14} color="#fff" />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.isUser && {
            backgroundColor: colors.primary,
          },
        ]}
      >
        {item.id === 'thinking-temp' ? (
          <ThinkingDots />
        ) : (
          <>
            <Text
              style={[
                styles.messageText,
                { color: item.isUser ? '#FFFFFF' : colors.text },
              ]}
            >
              {typingMessage?.id === item.id ? displayedText : item.text}
            </Text>
            {typingMessage?.id === item.id && <BlinkingCursor />}
          </>
        )}
      </View>
      {item.isUser && (
        <View style={[styles.userAvatarSmall, { backgroundColor: colors.secondary }]}>
          <Ionicons name="person" size={14} color="#fff" />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {selectedAgent?.logo ? (
            <Image
              source={{ uri: selectedAgent.logo }}
              style={styles.agentLogo}
            />
          ) : (
            <View style={[styles.agentLogo, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={18} color="#fff" />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {selectedAgent?.role || 'AI Employee'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {isLoadingMessages ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading messages...
            </Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Start Chatting
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Ask {selectedAgent?.role} anything about your business
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            inverted
          />
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
          <View style={styles.inputWrapper}>
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Message your AI employee..."
                placeholderTextColor={colors.textTertiary}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={2000}
                editable={!isSendingMessage}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: message.trim() && !isSendingMessage ? colors.primary : colors.surface,
                  },
                ]}
                onPress={handleSendMessage}
                disabled={!message.trim() || isSendingMessage}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={message.trim() && !isSendingMessage ? '#fff' : colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  agentLogo: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerText: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.base,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 20,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },
  aiMessageRow: {
    flexDirection: 'row',
  },
  aiAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  messageText: {
    fontSize: FontSize.base,
    lineHeight: 24,
    flexShrink: 1,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  thinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingCursor: {
    width: 2,
    height: 20,
    marginLeft: 4,
    marginBottom: 2,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
  },
  inputWrapper: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    minHeight: 44,
    maxHeight: 120,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
});
