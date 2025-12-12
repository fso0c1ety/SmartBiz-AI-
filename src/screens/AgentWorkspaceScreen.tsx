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
  Linking,
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
import { cacheMediaForContent, getCachedMediaForContent } from '../store/useMediaCache';
import { loadChatCache, saveChatCache } from '../store/usePersistentCache';
const simpleHash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString();
};

type AgentWorkspaceScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  type?: 'text' | 'image';
}

export const AgentWorkspaceScreen: React.FC<AgentWorkspaceScreenProps> = ({
  navigation,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const { selectedAgent } = useAgentStore();
  const { sendMessage: sendApiMessage, getMessages } = useApi();
  const { showToast } = useToastStore();

  const agentLogoSources: Record<string, any> = {
    alex: require('../../assets/robot1.jpg'),
    jordan: require('../../assets/robot2.jpg'),
    taylor: require('../../assets/robot3.jpg'),
    morgan: require('../../assets/robot4.jpg'),
    casey: require('../../assets/robot5.jpg'),
    default: require('../../assets/robot1.jpg'),
  };

  const getAgentLogoSource = () => {
    if (selectedAgent?.logo) return { uri: selectedAgent.logo };
    const key = selectedAgent?.name?.toLowerCase() || selectedAgent?.role?.toLowerCase();
    return (key && agentLogoSources[key]) || agentLogoSources.default;
  };

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingMessage, setTypingMessage] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedAgent?.id) {
        (async () => {
          const cached = await loadChatCache(selectedAgent.id as string);
          if (cached && cached.length) setMessages(cached);
          await loadMessages();
        })();
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

  const handleCopyMessage = (text: string) => {
    // Copy to clipboard functionality
    showToast('Message copied to clipboard', 'success');
    // In a real app, you'd use a clipboard library
  };

  const handlePauseGeneration = () => {
    setIsGenerating(false);
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    // Remove the thinking message and any partial AI response
    setMessages((prev) => prev.filter(msg => msg.id !== 'thinking-temp' && msg.id !== typingMessage?.id));
    setTypingMessage(null);
    setDisplayedText('');
    setIsSendingMessage(false);
    showToast('Generation stopped', 'info');
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
    showToast('Message deleted', 'success');
  };

  const handleRegenerateMessage = async (messageId: string) => {
    // Find the AI message and the user message before it, then resend
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.isUser) {
        // Remove the old AI response and thinking message
        const updatedMessages = messages.slice(0, messageIndex);
        setMessages(updatedMessages);
        
        // Resend the message
        setMessage(userMessage.text);
        showToast('🔄 Regenerating response...', 'info');
        
        // Wait a tick then send
        setTimeout(() => {
          handleSendMessage();
        }, 100);
      }
    }
  };

  const loadMessages = async () => {
    if (!selectedAgent?.id) return;

    setIsLoadingMessages(true);
    try {
      const apiMessages = await getMessages(selectedAgent.id);
      const formattedMessages: Message[] = await Promise.all(
        apiMessages.map(async (msg: any) => {
          const base: Message = {
            id: msg.id,
            text: msg.message,
            isUser: msg.role === 'user',
            timestamp: new Date(msg.createdAt),
            type: msg.type || (msg.media && msg.media.length ? 'image' : 'text'),
          };
          if (msg.media && msg.media.length > 0) {
            try {
              const existing = await getCachedMediaForContent(msg.id);
              const uris = existing || await cacheMediaForContent(msg.id, msg.media);
              return { ...base, imageUrl: uris[0] || (typeof msg.media[0] === 'string' ? msg.media[0] : (msg.media[0].base64 || msg.media[0].url)) };
            } catch {
              return { ...base, imageUrl: (typeof msg.media[0] === 'string' ? msg.media[0] : (msg.media[0].base64 || msg.media[0].url)) };
            }
          }
          return base;
        })
      );
      setMessages(formattedMessages);
      // Save locally for persistence
      try { if (selectedAgent?.id) await saveChatCache(selectedAgent.id, formattedMessages); } catch {}
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
    setIsGenerating(true);

    // Clean up any existing typing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    try {
      const response = await sendApiMessage(selectedAgent.id, userMessage.text);

      // Remove thinking message
      setMessages((prev) => prev.filter(msg => msg.id !== 'thinking-temp'));

      let imageUrl: string | undefined = response.imageUrl;
      if (response.media && response.media.length > 0) {
        // Prefer direct media payload
        const direct = typeof response.media[0] === 'string' ? response.media[0] : (response.media[0].base64 || response.media[0].url);
        imageUrl = direct || imageUrl;
        // Also cache to file system for stability if base64
        try {
          const key = response.messageId ? String(response.messageId) : (response.id ? String(response.id) : `msg-${simpleHash(response.message || '')}`);
          const uris = await cacheMediaForContent(key, response.media);
          imageUrl = uris[0] || imageUrl;
        } catch {}
      }
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        imageUrl,
        type: response.type || (imageUrl ? 'image' : 'text'),
      };
      // Push message media to backend for persistence
      try {
        if (response.media && response.media.length > 0 && (response.messageId || response.id)) {
          await updateMessageMedia({ messageId: String(response.messageId || response.id), media: response.media });
        }
      } catch {}

      // Add AI message and start typing animation
      setMessages((prev) => [...prev, aiMessage]);
      try { if (selectedAgent?.id) await saveChatCache(selectedAgent.id, [...messages, aiMessage]); } catch {}
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
          setIsGenerating(false);
        }
      }, 20);
    } catch (error: any) {
      setMessages((prev) => prev.filter(msg => msg.id !== 'thinking-temp'));
      showToast(error.message || 'Failed to send message', 'error');
      setIsGenerating(false);
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

  const renderMessage = ({ item }: { item: Message }) => {
    // If it's an image type message, render it as an image
    if (item.type === 'image' && item.imageUrl) {
      return (
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
              item.isUser && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: item.isUser ? '#FFFFFF' : colors.text },
              ]}
            >
              {item.text}
            </Text>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.generatedImage}
              onError={(e) => console.log('❌ Image load error:', e)}
              onLoad={() => console.log('✅ Image loaded successfully')}
            />
          </View>
          {item.isUser && (
            <View style={[styles.userAvatarSmall, { backgroundColor: colors.secondary }]}>
              <Ionicons name="person" size={14} color="#fff" />
            </View>
          )}
        </View>
      );
    }

    // Parse text for URLs and render as clickable links
    const parseTextWithLinks = (text: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = text.split(urlRegex);
      
      return parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <Text
              key={index}
              style={[
                styles.linkText,
                { color: item.isUser ? '#FFFFFF' : colors.primary },
              ]}
              onPress={() => {
                Linking.openURL(part).catch(err =>
                  console.error('Failed to open URL:', err)
                );
              }}
            >
              {part}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      });
    };

    // Regular text message rendering
    return (
      <View
        style={[
          styles.messageRow,
          item.isUser ? styles.userMessageRow : styles.aiMessageRow,
        ]}
        onTouchEnd={() => setHoveredMessageId(item.id)}
        onTouchCancel={() => setHoveredMessageId(null)}
      >
        {!item.isUser && (
          <Image
            source={getAgentLogoSource()}
            style={styles.aiAvatarSmall}
          />
        )}
        <View style={styles.messageContent}>
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
                  {typingMessage?.id === item.id
                    ? displayedText
                    : parseTextWithLinks(item.text)}
                </Text>
                {typingMessage?.id === item.id && <BlinkingCursor />}
              </>
            )}
          </View>
          {/* Message Options */}
          {hoveredMessageId === item.id && item.id !== 'thinking-temp' && (
            <View style={styles.messageOptions}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleCopyMessage(item.text)}
              >
                <Ionicons name="copy" size={14} color={colors.textSecondary} />
                <Text style={[styles.optionLabel, { color: colors.textSecondary }]}>Copy</Text>
              </TouchableOpacity>
              {!item.isUser && (
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => handleRegenerateMessage(item.id)}
                >
                  <Ionicons name="refresh" size={14} color={colors.primary} />
                  <Text style={[styles.optionLabel, { color: colors.primary }]}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {item.isUser && (
          <View style={[styles.userAvatarSmall, { backgroundColor: colors.secondary }]}>
            <Ionicons name="person" size={14} color="#fff" />
          </View>
        )}
      </View>
    );
  };

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
          <Image
            source={getAgentLogoSource()}
            style={styles.agentLogo}
          />
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
                    backgroundColor: isGenerating ? '#EF4444' : (message.trim() && !isSendingMessage ? colors.primary : colors.surface),
                  },
                ]}
                onPress={isGenerating ? handlePauseGeneration : handleSendMessage}
                disabled={!isGenerating && (!message.trim() || isSendingMessage)}
              >
                <Ionicons
                  name={isGenerating ? "pause" : "arrow-up"}
                  size={20}
                  color={isGenerating ? '#fff' : (message.trim() && !isSendingMessage ? '#fff' : colors.textTertiary)}
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
  messageContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  aiAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    resizeMode: 'cover',
  },
  avatarEmoji: {
    fontSize: 18,
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
  },
  messageText: {
    fontSize: FontSize.base,
    lineHeight: 24,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  generatedImage: {
    width: 250,
    height: 250,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
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
    borderWidth: 2,
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
  messageOptions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  optionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});
