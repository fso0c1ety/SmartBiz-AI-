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

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        imageUrl: response.imageUrl,
        type: response.type || 'text',
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
    // Detect labeled content types in assistant messages and render with wrappers
    const detectKind = (text: string) => {
      const lower = text.toLowerCase();
      // Prefer explicit markers
      if (lower.includes('<<caption_start>>')) return 'caption';
      if (lower.includes('<<post_start>>')) return 'post';
      if (lower.includes('<<email_start>>')) return 'email';
      if (lower.includes('<<blog_start>>')) return 'blog';
      if (lower.includes('<<ad_start>>')) return 'ad';
      if (lower.includes('<<code_start>>')) return 'code';
      // Fallback to label prefixes
      if (lower.startsWith('caption:')) return 'caption';
      if (lower.startsWith('post:')) return 'post';
      if (lower.startsWith('email:')) return 'email';
      if (lower.startsWith('blog:')) return 'blog';
      if (lower.startsWith('ad:')) return 'ad';
      if (lower.startsWith('code:')) return 'code';
      return 'text';
    };

    const stripLabel = (text: string) => text.replace(/^\s*([A-Za-z]+)\s*:\s*/i, '').trim();
    const extractBetweenMarkers = (text: string, start: string, end: string) => {
      // Robust extraction using regex; returns inner content only
      const pattern = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([\s\S]*?)${end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, 'i');
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
      // Index-based fallback (case-insensitive)
      const lower = text.toLowerCase();
      const sIdx = lower.indexOf(start.toLowerCase());
      const eIdx = lower.indexOf(end.toLowerCase());
      if (sIdx !== -1 && eIdx !== -1 && eIdx > sIdx) {
        const inner = text.substring(sIdx + start.length, eIdx);
        return inner.trim();
      }
      // Fallback: remove label prefix if markers missing
      return stripLabel(text);
    };

    const kind = !item.isUser ? detectKind(item.text) : 'text';
    let contentText = !item.isUser ? stripLabel(item.text) : item.text;
    if (!item.isUser) {
      const markerMap: Record<string, { start: string; end: string }> = {
        caption: { start: '<<CAPTION_START>>', end: '<<CAPTION_END>>' },
        post: { start: '<<POST_START>>', end: '<<POST_END>>' },
        email: { start: '<<EMAIL_START>>', end: '<<EMAIL_END>>' },
        blog: { start: '<<BLOG_START>>', end: '<<BLOG_END>>' },
        ad: { start: '<<AD_START>>', end: '<<AD_END>>' },
        code: { start: '<<CODE_START>>', end: '<<CODE_END>>' },
      };
      if (markerMap[kind]) {
        const { start, end } = markerMap[kind];
        contentText = extractBetweenMarkers(item.text, start, end);
      }
    }

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

    // Specialized rendering
    if (!item.isUser) {
      // Code block (only when explicitly labeled)
      if (kind === 'code') {
        const codeMatch = contentText.match(/```[a-zA-Z0-9]*\n([\s\S]*?)```/);
        const code = (codeMatch ? codeMatch[1] : contentText).trim();
        return (
          <View style={[styles.messageRow, styles.aiMessageRow]}>
            <Image source={getAgentLogoSource()} style={styles.aiAvatarSmall} />
            <View style={[styles.messageContent]}>
              <View style={[styles.messageBubble, { backgroundColor: colors.surface }]}> 
                <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>Code</Text>
                <View style={[styles.codeContainer, { backgroundColor: colorScheme === 'dark' ? '#0B0F19' : '#F5F7FA', borderColor: colors.border }]}> 
                  <Text style={[styles.codeText, { color: colors.text }]}>{code}</Text>
                  <View style={styles.blockActions}>
                    <TouchableOpacity style={styles.blockButton} onPress={() => handleCopyMessage(code)}>
                      <Ionicons name="copy" size={14} color={colors.textSecondary} />
                      <Text style={[styles.blockButtonText, { color: colors.textSecondary }]}>Copy code</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }

      // Email (only when explicitly labeled)
      if (kind === 'email') {
        const subjectMatch = contentText.match(/subject:\s*(.*)/i);
        const body = contentText.replace(/subject:.*\n?/i, '').trim();
        const subject = subjectMatch ? subjectMatch[1].trim() : 'Email';
        return (
          <View style={[styles.messageRow, styles.aiMessageRow]}>
            <Image source={getAgentLogoSource()} style={styles.aiAvatarSmall} />
            <View style={[styles.messageContent]}>
              <View style={[styles.messageBubble, { backgroundColor: colors.surface }]}> 
                <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>Email</Text>
                <View style={[styles.emailCard, { borderColor: colors.border, backgroundColor: colorScheme === 'dark' ? '#0B0F19' : '#FFFFFF' }]}> 
                  <Text style={[styles.emailSubject, { color: colors.text }]}>{subject}</Text>
                  <Text style={[styles.emailBody, { color: colors.textSecondary }]}>{body}</Text>
                  <View style={styles.blockActions}>
                    <TouchableOpacity style={styles.blockButton} onPress={() => handleCopyMessage(`${subject}\n\n${body}`)}>
                      <Ionicons name="copy" size={14} color={colors.textSecondary} />
                      <Text style={[styles.blockButtonText, { color: colors.textSecondary }]}>Copy email</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }

      // Caption / Post / Ad / Blog simple wrappers
      const labelMap: Record<string, string> = {
        caption: 'Caption',
        post: 'Post',
        ad: 'Ad',
        blog: 'Blog',
      };
      if (kind !== 'text') {
        return (
          <View style={[styles.messageRow, styles.aiMessageRow]}>
            <Image source={getAgentLogoSource()} style={styles.aiAvatarSmall} />
            <View style={[styles.messageContent]}>
              <View style={[styles.messageBubble, { backgroundColor: colors.surface }]}> 
                <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>{labelMap[kind] || 'Content'}</Text>
                <Text style={[styles.messageText, { color: colors.text }]}>{contentText}</Text>
              </View>
            </View>
          </View>
        );
      }
    }

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
  messageLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  emailCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  emailSubject: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  emailBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  blockActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  blockButtonText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
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
