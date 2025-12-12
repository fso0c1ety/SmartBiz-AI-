import axios from 'axios';
import prisma from '../config/database';
import { AIMemoryService } from './ai-memory.service';

// DeepSeek-only mode for chat/completions.
const useDeepSeek = true;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

console.log('🤖 AI provider: DeepSeek only');

const checkDeepSeekKey = () => {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error(
      'DeepSeek API key not configured. Add DEEPSEEK_API_KEY to backend/.env. '
    );
  }
};

async function createChatCompletion({
  messages,
  temperature,
  maxTokens,
}: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature: number;
  maxTokens: number;
}) {
  if (useDeepSeek) {
    checkDeepSeekKey();
    try {
      console.log('🤖 Calling DeepSeek API...');
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: DEEPSEEK_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          },
          timeout: 60000, // 60 seconds timeout
        }
      );

      console.log('✅ DeepSeek API response received');
      const choice = response.data?.choices?.[0];
      return {
        content: choice?.message?.content || '',
        usage: response.data?.usage || null,
      };
    } catch (err: any) {
      console.error('❌ DeepSeek API error:', err.message);
      console.error('Error details:', err.response?.data || err);
      
      const status = err?.response?.status || err?.status;
      const detail =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Unknown DeepSeek error';

      if (status === 401 || status === 403) {
        throw new Error('DeepSeek authentication failed. Verify DEEPSEEK_API_KEY.');
      }
      if (status === 429) {
        throw new Error('DeepSeek rate limit/quota exceeded. Please try again later.');
      }
      throw new Error(detail);
    }
  }

  // In DeepSeek-only mode, this should not be reached.
  throw new Error('DeepSeek is required for chat. Set DEEPSEEK_API_KEY in backend/.env.');
}

const ensureProviderConfigured = () => {
  checkDeepSeekKey();
};

export interface ChatInput {
  agentId: string;
  message: string;
  userId: string;
}

export interface ContentGenerationInput {
  agentId: string;
  type: string; // "post", "caption", "ad", "blog", "image", etc.
  prompt: string;
  userId: string;
}

export interface ImageGenerationInput {
  agentId: string;
  prompt: string;
  userId: string;
  size?: '1024x1024' | '512x512' | '256x256';
}

export class AIService {
  private static sanitizeEmailMarkers(text: string) {
    // Remove START/END markers, horizontal rules, and duplicate Subject lines inside body
    let cleaned = text
      .replace(/<<EMAIL_START>>/g, '')
      .replace(/<<EMAIL_END>>/g, '')
      .replace(/^\s*-{3,}\s*$/gm, '')
      .trim();
    // Remove lines like "**Subject:** ..." or "Subject: ..." inside body
    cleaned = cleaned.replace(/^\s*(\*\*\s*)?subject\s*:\s*.*$/gmi, '').trim();
    return cleaned;
  }

  private static detectRequestedType(text: string): 'email' | 'code' | 'blog' | 'post' | 'caption' | 'ad' | null {
    const t = text.toLowerCase();
    if (/\bemail\b/.test(t)) return 'email';
    if (/\bcode\b|```/.test(t)) return 'code';
    if (/\bblog\b/.test(t)) return 'blog';
    if (/\bpost\b|\btweet\b|social\s+post/.test(t)) return 'post';
    if (/\bcaption\b/.test(t)) return 'caption';
    if (/\b(ad|advertisement)\b/.test(t)) return 'ad';
    if (/\b(image|picture|photo|banner|logo|graphic|illustration)\b/.test(t)) return 'image' as any;
    return null;
  }

  private static minimalReplyInstruction(type: string): string {
    switch (type) {
      case 'email':
        return 'Reply ONLY with:\nSubject: <subject>\n\nBody:\n<body>. Use exactly these prefixes. Do not add comments, suggestions, extra lines, or anything else.';
      case 'code':
        return 'Reply ONLY with:\nCode:\n<raw code>. Use exactly this prefix. No explanations, no markdown fences, no comments.';
      case 'blog':
        return 'Reply ONLY with:\nBlog:\n<blog text>. Use exactly this prefix. No commentary or meta instructions.';
      case 'post':
        return 'Reply ONLY with:\nPost:\n<post text>. Use exactly this prefix. No extra commentary.';
      case 'caption':
        return 'Reply ONLY with:\nCaption:\n<caption text>. Use exactly this prefix. No extra commentary.';
      case 'ad':
        return 'Reply ONLY with:\nAd:\n<ad copy>. Use exactly this prefix. No extra commentary.';
      default:
        return 'Reply concisely with content only.';
    }
  }

  private static parseTaggedContent(text: string) {
    const out: any = {};
    const emailSubject = text.match(/\bSubject:\s*(.*)/i)?.[1]?.trim();
    const emailBody = text.match(/\bBody:\s*([\s\S]*)/i)?.[1]?.trim();
    if (emailSubject || emailBody) {
      out.subject = emailSubject?.replace(/^\*\*\s*|\s*\*\*$/g, '').trim();
      out.body = AIService.sanitizeEmailMarkers(emailBody || '');
    }
    const codeBlock = text.match(/\bCode:\s*([\s\S]*)/i)?.[1] || '';
    if (codeBlock) {
      // Reuse code sanitizer (remove fences, language headers)
      const fenceRegex = /```[\w-]*\n([\s\S]*?)```/g;
      const blocks: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = fenceRegex.exec(codeBlock)) !== null) {
        const raw = m[1];
        const lines = raw.split(/\r?\n/);
        const maybeLang = lines[0]?.trim();
        const isLangHeader = /^(tsx?|jsx?|json|html|css|python|java|c\+\+|c|go|rust|sql|bash|sh)$/i.test(maybeLang);
        const code = isLangHeader ? lines.slice(1).join('\n') : raw;
        blocks.push(code.trim());
      }
      out.code = blocks.length > 0 ? blocks.join('\n\n') : codeBlock.replace(/```/g, '').trim();
    }
    const caption = text.match(/\bCaption:\s*([\s\S]*)/i)?.[1]?.trim();
    if (caption) out.caption = caption;
    const post = text.match(/\bPost:\s*([\s\S]*)/i)?.[1]?.trim();
    if (post) out.post = post;
    const ad = text.match(/\bAd:\s*([\s\S]*)/i)?.[1]?.trim();
    if (ad) out.ad = ad;
    const blog = text.match(/\bBlog:\s*([\s\S]*)/i)?.[1]?.trim();
    if (blog) out.blog = blog;
    return out;
  }
  /**
   * Chat with an AI agent
   */
  static async chat(input: ChatInput) {
    ensureProviderConfigured();
    
    const { agentId, message, userId } = input;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        business: { userId },
      },
      include: { business: true },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Check if user is requesting image generation
    const imageKeywords = /\b(generate|create|make|design|draw)\s+(a|an|the|me|my)?\s*(logo|image|picture|graphic|illustration|banner|poster|icon|photo|artwork|design)\b/i;
    const isImageRequest = imageKeywords.test(message) || AIService.detectRequestedType(message) === ('image' as any);

    if (isImageRequest) {
      // Extract the image description from the message
      const imagePrompt = message.replace(/^(please|can you|could you|i want you to|i need you to|do that)\s+/i, '').trim();
      
      console.log('🎨 Image request detected:', imagePrompt);
      
      try {
        // Generate the image
        const imageResult = await this.generateImage({
          agentId,
          prompt: imagePrompt,
          userId,
        });

        console.log('✅ Image generated:', imageResult.imageUrl);

        // Store user message
        await prisma.message.create({
          data: {
            agentId,
            role: 'user',
            message,
          },
        });

        // Minimal assistant response to avoid description
        const assistantMessage = `Image generated.`;
        const created = await prisma.message.create({
          data: {
            agentId,
            role: 'assistant',
            message: assistantMessage,
          },
        });

        const mediaUris = [imageResult.imageDataUrl || imageResult.imageUrl].filter(Boolean) as string[];

        return {
          messageId: created.id,
          message: assistantMessage,
          type: 'image',
          imageUrl: imageResult.imageUrl,
          media: mediaUris,
          imagePrompt: imagePrompt,
          usage: null,
        };
      } catch (error: any) {
        // If image generation fails, fall back to text response
        console.error('❌ Image generation failed:', error.message);
      }
    }

    // Store user message
    await prisma.message.create({
      data: {
        agentId,
        role: 'user',
        message,
      },
    });

    // Build AI context with memory
    const { systemPrompt, recentMessages } = await AIMemoryService.buildAIContext(
      agentId,
      message
    );

    // Prepare conversation history
    const conversationHistory = recentMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.message,
    }));

    // Call provider; fallback locally if quota exceeded
    let assistantMessage = '';
    let usage: any = null;
    try {
      const requestedType = AIService.detectRequestedType(message);
      const minimalInstruction = requestedType ? AIService.minimalReplyInstruction(requestedType) : '';
      const completion = await createChatCompletion({
        messages: [
          { role: 'system', content: minimalInstruction ? `${systemPrompt}\n\n${minimalInstruction}` : systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        maxTokens: 1000,
      });
      assistantMessage = completion.content;
      usage = completion.usage;
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 429 || /quota/i.test(err?.message || '')) {
        const fallbackMessage = `I'm currently at capacity. Here's a quick on-brand reply: ${message}`;
        assistantMessage = fallbackMessage;
        usage = null;

        await prisma.message.create({
          data: {
            agentId,
            role: 'assistant',
            message: fallbackMessage,
          },
        });

        return {
          message: fallbackMessage,
          usage: null,
          note: 'Served from local fallback due to provider quota/rate limit.',
        };
      }
      throw err;
    }

    // Store assistant response (will update below if we sanitize types)
    await prisma.message.create({
      data: {
        agentId,
        role: 'assistant',
        message: assistantMessage,
      },
    });
    // Detect content types in assistant reply and persist to content feed
    const lower = assistantMessage.toLowerCase();
    const detectors: Array<{ type: string; test: (t: string) => boolean }> = [
      { type: 'caption', test: (t) => /\bcaption\b/.test(t) || /#\w+/.test(t) },
      { type: 'post', test: (t) => /\b(post|tweet|social\s+post)\b/.test(t) },
      { type: 'email', test: (t) => /subject:\s|\bdear\b|\bbest regards\b/.test(t) },
      { type: 'blog', test: (t) => /\b(blog|introduction|outline)\b/.test(t) },
      { type: 'ad', test: (t) => /\b(ad|advertisement|cta|call to action)\b/.test(t) },
      { type: 'code', test: (t) => /```|\bfunction\b|\bconst\b|\bclass\b/.test(t) },
    ];

    const matched = detectors.find((d) => d.test(lower)) ||
      // Heuristic: if user explicitly asked for email
      (/\bemail\b/.test(message.toLowerCase()) ? { type: 'email', test: () => true } : undefined);
    if (matched) {
      try {
        let subject: string | undefined;
        let body: string | undefined;
        let sanitizedContent = assistantMessage;
        const tagged = AIService.parseTaggedContent(assistantMessage);

        if (matched.type === 'email') {
          // Try to extract Subject and Body blocks
          const subjectMatch = assistantMessage.match(/subject\s*:\s*(.*)/i);
          const bodyMatch = assistantMessage.match(/body\s*:\s*([\s\S]*)/i);
          subject = (tagged.subject || subjectMatch?.[1]?.trim());
          // If no explicit Body:, split by first blank line
          if (bodyMatch?.[1]) {
            body = AIService.sanitizeEmailMarkers(bodyMatch[1].trim());
          } else {
            const lines = assistantMessage.split(/\r?\n/);
            const firstLine = lines[0]?.trim();
            const rest = lines.slice(1).join('\n').trim();
            if (!subject && firstLine) subject = firstLine.replace(/^subject\s*:\s*/i, '').trim();
            body = AIService.sanitizeEmailMarkers(tagged.body || rest || assistantMessage.trim());
          }
          // Clean subject markdown emphasis like ** ... **
          if (subject) subject = subject.replace(/^\*\*\s*|\s*\*\*$/g, '').trim();

          // Enforce sanitized email rendering: rebuild content block
          sanitizedContent = `Subject: ${subject || 'Untitled'}\n\nBody:\n${body}`.trim();
          // Also sanitize the chat message so marks don't appear in chat view
          assistantMessage = sanitizedContent;
          await prisma.message.create({
            data: {
              agentId,
              role: 'assistant',
              message: sanitizedContent,
            },
          });
        }

        if (matched.type === 'code') {
          // Strip ALL Markdown code fences; support multiple blocks
          const fenceRegex = /```[\w-]*\n([\s\S]*?)```/g;
          const blocks: string[] = [];
          let m: RegExpExecArray | null;
          while ((m = fenceRegex.exec(assistantMessage)) !== null) {
            const raw = m[1];
            const lines = raw.split(/\r?\n/);
            const maybeLang = lines[0]?.trim();
            const isLangHeader = /^(tsx?|jsx?|json|html|css|python|java|c\+\+|c|go|rust|sql|bash|sh)$/i.test(maybeLang);
            const code = isLangHeader ? lines.slice(1).join('\n') : raw;
            blocks.push(code.trim());
          }
          if (tagged.code) {
            sanitizedContent = tagged.code;
          } else if (blocks.length > 0) {
            sanitizedContent = blocks.join('\n\n');
          } else {
            sanitizedContent = assistantMessage.replace(/```/g, '').trim();
          }
          // Reflect sanitized code in chat history
          assistantMessage = sanitizedContent;
          await prisma.message.create({
            data: {
              agentId,
              role: 'assistant',
              message: sanitizedContent,
            },
          });
        }

        await prisma.content.create({
          data: {
            agentId,
            type: matched.type,
            data: JSON.stringify({
              prompt: 'Detected from chat reply',
              content: sanitizedContent,
              ...(subject ? { subject } : {}),
              ...(body ? { body } : {}),
              status: 'draft',
              generatedAt: new Date().toISOString(),
            }),
          },
        });
      } catch (e: any) {
        console.error('Failed to persist detected content from chat:', e.message);
      }
    }

    return {
      message: assistantMessage,
      usage,
      detectedType: matched?.type || null,
    };
  }

  /**
   * Generate content using AI agent
   */
  static async generateContent(input: ContentGenerationInput) {
    ensureProviderConfigured();
    
    const { agentId, type, prompt, userId } = input;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        business: { userId },
      },
      include: { business: true },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Build AI context
    const { systemPrompt } = await AIMemoryService.buildAIContext(agentId, prompt);

    // Content-specific prompts
    const contentPrompts: Record<string, string> = {
      post: `Create a social media post about: ${prompt}\n\nInclude relevant hashtags and make it engaging.`,
      caption: `Write an Instagram caption for: ${prompt}\n\nMake it catchy and include emojis where appropriate.`,
      ad: `Create an advertisement copy for: ${prompt}\n\nMake it persuasive and highlight key benefits.`,
      blog: `Write a blog post introduction about: ${prompt}\n\nMake it informative and engaging.`,
      email: `Write a professional email about: ${prompt}\n\nKeep it concise and actionable.`,
    };

    const contentPrompt = contentPrompts[type] || prompt;
    const minimalInstruction = AIService.minimalReplyInstruction(type);

    // Generate content
    let generatedContent = '';
    let usage: any = null;
    try {
      const completion = await createChatCompletion({
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\nYou are creating ${type} content. Make it professional, on-brand, and effective.\n\n${minimalInstruction}`,
          },
          { role: 'user', content: contentPrompt },
        ],
        temperature: 0.8,
        maxTokens: 1500,
      });
      generatedContent = completion.content;
      usage = completion.usage;
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 429 || /quota/i.test(err?.message || '')) {
        // Local fallback content
        generatedContent = `Fallback ${type}: ${prompt}\n\n(Generated locally because provider quota was exceeded.)`;

        const content = await prisma.content.create({
          data: {
            agentId,
            type,
            data: JSON.stringify({
              prompt,
              content: generatedContent,
              generatedAt: new Date().toISOString(),
              note: 'Served from local fallback due to provider quota/rate limit.',
            }),
          },
        });

        return {
          content,
          usage: null,
          note: 'Served from local fallback due to provider quota/rate limit.',
        };
      }
      throw err;
    }

    // If email, sanitize to extract subject/body
    let subject: string | undefined;
    let body: string | undefined;
    const tagged = AIService.parseTaggedContent(generatedContent);
    if (type === 'email') {
      const subjectMatch = generatedContent.match(/subject\s*:\s*(.*)/i);
      const bodyMatch = generatedContent.match(/body\s*:\s*([\s\S]*)/i);
      subject = (tagged.subject || subjectMatch?.[1]?.trim());
      if (bodyMatch?.[1]) {
        body = AIService.sanitizeEmailMarkers(bodyMatch[1].trim());
      } else {
        const lines = generatedContent.split(/\r?\n/);
        const firstLine = lines[0]?.trim();
        const rest = lines.slice(1).join('\n').trim();
        if (!subject && firstLine) subject = firstLine.replace(/^subject\s*:\s*/i, '').trim();
        body = AIService.sanitizeEmailMarkers(tagged.body || rest || generatedContent.trim());
      }
      if (subject) subject = subject.replace(/^\*\*\s*|\s*\*\*$/g, '').trim();
      generatedContent = `Subject: ${subject || 'Untitled'}\n\nBody:\n${body}`.trim();
    }
    if (type === 'code') {
      // Sanitize code outputs similarly to chat path
      const fenceRegex = /```[\w-]*\n([\s\S]*?)```/g;
      const blocks: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = fenceRegex.exec(generatedContent)) !== null) {
        const raw = m[1];
        const lines = raw.split(/\r?\n/);
        const maybeLang = lines[0]?.trim();
        const isLangHeader = /^(tsx?|jsx?|json|html|css|python|java|c\+\+|c|go|rust|sql|bash|sh)$/i.test(maybeLang);
        const code = isLangHeader ? lines.slice(1).join('\n') : raw;
        blocks.push(code.trim());
      }
      generatedContent = tagged.code
        ? tagged.code
        : (blocks.length > 0
            ? blocks.join('\n\n')
            : generatedContent.replace(/```/g, '').trim());
    }

    // Store generated content
    const content = await prisma.content.create({
      data: {
        agentId,
        type,
        data: JSON.stringify({
          prompt,
          content: generatedContent,
          ...(subject ? { subject } : {}),
          ...(body ? { body } : {}),
          businessName: agent.business.name,
          brandTone: agent.business.brandTone,
          generatedAt: new Date().toISOString(),
        }),
      },
    });

    return {
      content,
      usage,
    };
  }

  /**
   * Get all messages for an agent
   */
  static async getMessages(agentId: string, userId: string) {
    // Verify ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        business: { userId },
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    const messages = await prisma.message.findMany({
      where: { agentId },
      orderBy: { createdAt: 'asc' },
    });

    // Attach media by looking up related image content created from this messageId
    const imageContents = await prisma.content.findMany({
      where: { agentId, type: 'image' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const withMedia = messages.map((m) => {
      try {
        const match = imageContents.find((c) => {
          const data = JSON.parse(c.data || '{}');
          return String(data.fromMessageId || '') === String(m.id);
        });
        if (!match) return m as any;
        const data = JSON.parse(match.data || '{}');
        const media = data.media || [];
        if (Array.isArray(media) && media.length > 0) return { ...m, media } as any;
      } catch {}
      return m as any;
    });

    return withMedia;
  }

  /**
   * Get all generated content for an agent
   */
  static async getAllContent(agentId: string, userId: string) {
    // Verify ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        business: { userId },
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    const contents = await prisma.content.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    });

    return contents;
  }

  /**
   * Get filtered content across all agents
   */
  static async getFilteredContent(params: {
    agentId?: string;
    type?: string;
    limit: number;
    userId: string;
  }) {
    const { agentId, type, limit, userId } = params;

    // Build where clause
    const where: any = {};
    
    if (agentId) {
      // Verify agent ownership
      const agent = await prisma.agent.findFirst({
        where: {
          id: agentId,
          business: { userId },
        },
      });
      if (!agent) {
        throw new Error('Agent not found');
      }
      where.agentId = agentId;
    } else {
      // Get all agents for user
      const agents = await prisma.agent.findMany({
        where: {
          business: { userId },
        },
        select: { id: true },
      });
      where.agentId = { in: agents.map((a) => a.id) };
    }

    if (type) {
      where.type = type;
    }

    const contents = await prisma.content.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            agentName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    // Fetch relational media (fallback) and merge
    const ids = contents.map((c) => c.id);
    let mediaRows: Array<any> = [];
    try {
      // Using raw query to avoid Prisma 7 migration hurdles
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
      if (ids.length > 0) {
        mediaRows = await prisma.$queryRawUnsafe(`SELECT * FROM media WHERE contentId IN (${placeholders}) ORDER BY createdAt DESC`, ...ids);
      }
    } catch (e: any) {
      console.warn('⚠️ Failed to query media rows:', e?.message || e);
    }
    const byContent: Record<string, Array<string>> = {};
    for (const r of mediaRows) {
      const arr = byContent[r.contentid] || []; // note: column names may be lowercased
      const uri = r.url || (r.base64 ? `data:${r.mimetype || 'image/png'};base64,${r.base64}` : null);
      if (uri) arr.push(uri);
      byContent[r.contentid] = arr;
    }
    // Transform to match frontend format
    return contents.map((content) => {
      const data = JSON.parse(content.data || '{}');
      const mergedMedia = byContent[content.id] || [];
      return {
        id: content.id,
        agentId: content.agentId,
        agentName: content.agent.agentName,
        type: content.type,
        platform: data.platform,
        content: data.content || data.text || data.caption || '',
        imageUrl: data.imageUrl,
        subject: data.subject,
        body: data.body,
        media: (data.media && data.media.length ? data.media : mergedMedia),
        status: data.status || 'draft',
        createdAt: content.createdAt.toISOString(),
        engagement: data.engagement || {},
      };
    });
  }

  /**
   * Update content media: merge media array into stored JSON
   */
  static async updateContentMedia(input: { contentId: string; media: Array<string | { base64?: string; url?: string }>; userId: string }) {
    const { contentId, media, userId } = input;
    const content = await prisma.content.findFirst({ where: { id: contentId }, include: { agent: { include: { business: true } } } });
    if (!content) throw new Error('Content not found');
    if (content.agent.business.userId !== userId) throw new Error('Unauthorized');
    const data = JSON.parse(content.data || '{}');
    const uris = (media || []).map((m: any) => typeof m === 'string' ? m : (m.base64 || m.url)).filter(Boolean);
    data.media = uris;
    const updated = await prisma.content.update({ where: { id: contentId }, data: { data: JSON.stringify(data) } });
    return updated;
  }

  /**
   * Update message media by creating/updating a linked content record
   */
  static async updateMessageMedia(input: { messageId: string; media: Array<string | { base64?: string; url?: string }>; userId: string }) {
    const { messageId, media, userId } = input;
    const message = await prisma.message.findFirst({ where: { id: messageId }, include: { agent: { include: { business: true } } } });
    if (!message) throw new Error('Message not found');
    if (message.agent.business.userId !== userId) throw new Error('Unauthorized');
    const uris = (media || []).map((m: any) => typeof m === 'string' ? m : (m.base64 || m.url)).filter(Boolean);
    // Persist to media table (fallback when available)
    try {
      for (const m of uris) {
        const isData = /^data:image\//i.test(m);
        const isHttp = /^https?:\/\//i.test(m);
        const mime = isData ? (m.split(';')[0].replace('data:', '') || 'image/png') : null;
        const base64 = isData ? m.split(',')[1] : null;
        await prisma.$executeRawUnsafe(
          `INSERT INTO media (agentId, messageId, url, base64, mimeType) VALUES ($1, $2, $3, $4, $5)`,
          message.agentId,
          messageId,
          isHttp ? m : null,
          base64,
          mime
        );
      }
    } catch (e: any) {
      console.warn('⚠️ Failed to insert media rows:', e?.message || e);
    }
    // Try to find an existing content referencing this message
    const existing = await prisma.content.findFirst({ where: { agentId: message.agentId, type: 'image' } });
    const payload = {
      prompt: 'Generated via chat',
      media: uris,
      generatedAt: new Date().toISOString(),
      fromMessageId: messageId,
    };
    if (existing) {
      const data = JSON.parse(existing.data || '{}');
      const next = { ...data, ...payload };
      return prisma.content.update({ where: { id: existing.id }, data: { data: JSON.stringify(next) } });
    }
    return prisma.content.create({ data: { agentId: message.agentId, type: 'image', data: JSON.stringify(payload) } });
  }

  /**
   * Generate AI image using external API
   * Provider-selectable via env: IMAGE_PROVIDER=pollinations|replicate|stability
   */
  static async generateImage(input: ImageGenerationInput) {
    const { agentId, prompt, userId, size = '1024x1024' } = input;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        business: { userId },
      },
      include: { business: true },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Enhance prompt with business context and add guardrails to avoid unintended human subjects or biased defaults
    let enhancedPrompt = `${prompt}. Brand: ${agent.business.name}. Style: ${agent.business.brandTone || 'professional'}`;
    const normalized = prompt.toLowerCase();
    const mentionsPerson = /(person|people|man|woman|male|female|guy|girl|model|portrait|face|headshot|human)/i.test(normalized);
    if (!mentionsPerson) {
      enhancedPrompt += '. No human subjects. Focus on typography, abstract graphics, product or brand elements.';
    } else {
      enhancedPrompt += '. Avoid stereotypes. Neutral, inclusive depiction. No specific ethnicity unless explicitly requested.';
    }
    // Encourage neutral background and brand colors to reduce provider defaults
    enhancedPrompt += '. Neutral background. Use brand colors.';

    const provider = (process.env.IMAGE_PROVIDER || 'pollinations').toLowerCase();
    const [w, h] = size.split('x').map((v) => parseInt(v, 10));

    try {
      if (provider === 'replicate') {
        if (!process.env.REPLICATE_API_TOKEN) {
          throw new Error('REPLICATE_API_TOKEN not set. Set IMAGE_PROVIDER=pollinations or add the token.');
        }
        // Replicate SDXL or Flux Schnell
        const model = process.env.REPLICATE_MODEL || 'stability-ai/sdxl';
        const apiUrl = `https://api.replicate.com/v1/predictions`;
        const body: any = {
          version: process.env.REPLICATE_VERSION || undefined,
          // For hosted models, pass input
          input: {
            prompt: enhancedPrompt,
            width: w,
            height: h,
          },
          model,
        };
        // Remove undefineds
        Object.keys(body).forEach((k) => body[k] === undefined && delete body[k]);
        const resp = await axios.post(apiUrl, body, {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        });
        // Poll until completed if necessary
        let prediction = resp.data;
        const getUrl = prediction?.urls?.get;
        const status = prediction?.status;
        let output: any = prediction?.output;
        if (status !== 'succeeded' && getUrl) {
          const started = Date.now();
          while (Date.now() - started < 180000) { // up to 3 minutes
            await new Promise((r) => setTimeout(r, 2000));
            const p = await axios.get(getUrl, {
              headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
            });
            prediction = p.data;
            if (prediction.status === 'succeeded') { output = prediction.output; break; }
            if (prediction.status === 'failed' || prediction.status === 'canceled') {
              throw new Error(`Replicate ${prediction.status}`);
            }
          }
        }
        const imageUrl = Array.isArray(output) ? output[0] : output; // usually an array of URLs
        // Inline
        let base64Image: string | null = null;
        try {
          const imgResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const mime = imgResp.headers['content-type'] || 'image/png';
          const b64 = Buffer.from(imgResp.data, 'binary').toString('base64');
          base64Image = `data:${mime};base64,${b64}`;
        } catch {}
        const content = await prisma.content.create({
          data: {
            agentId,
            type: 'image',
            data: JSON.stringify({
              prompt: enhancedPrompt,
              imageUrl,
              media: base64Image ? [base64Image] : [imageUrl],
              size,
              businessName: agent.business.name,
              generatedAt: new Date().toISOString(),
              provider: 'Replicate',
              model,
            }),
          },
        });
        return { content, imageUrl, imageDataUrl: base64Image || null, usage: null };
      }

      if (provider === 'stability') {
        if (!process.env.STABILITY_API_KEY) {
          throw new Error('STABILITY_API_KEY not set. Set IMAGE_PROVIDER=pollinations or add the key.');
        }
        // Stability API (Stable Diffusion XL)
        const apiUrl = `https://api.stability.ai/v1/generation/sdxl-1.0/text-to-image`;
        const body = {
          text_prompts: [{ text: enhancedPrompt }],
          width: w,
          height: h,
          cfg_scale: 7,
          samples: 1,
        };
        const resp = await axios.post(apiUrl, body, {
          headers: {
            Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 120000,
        });
        const artifact = resp.data?.artifacts?.[0];
        const base64Image: string | null = artifact?.base64 ? `data:image/png;base64,${artifact.base64}` : null;
        const imageUrl = null; // Stability returns base64 by default here
        const content = await prisma.content.create({
          data: {
            agentId,
            type: 'image',
            data: JSON.stringify({
              prompt: enhancedPrompt,
              imageUrl,
              media: base64Image ? [base64Image] : [],
              size,
              businessName: agent.business.name,
              generatedAt: new Date().toISOString(),
              provider: 'Stability',
              model: 'sdxl-1.0',
            }),
          },
        });
        return { content, imageUrl, imageDataUrl: base64Image || null, usage: null };
      }

      // Default: Pollinations (free, no key)
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${w}&height=${h}&nologo=true`;
      let base64Image: string | null = null;
      try {
        const imgResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const mime = imgResp.headers['content-type'] || 'image/png';
        const b64 = Buffer.from(imgResp.data, 'binary').toString('base64');
        base64Image = `data:${mime};base64,${b64}`;
      } catch (e: any) {
        console.warn('⚠️ Failed to inline image; falling back to URL:', e.message);
      }
      const content = await prisma.content.create({
        data: {
          agentId,
          type: 'image',
          data: JSON.stringify({
            prompt: enhancedPrompt,
            imageUrl,
            media: base64Image ? [base64Image] : [imageUrl],
            size,
            businessName: agent.business.name,
            generatedAt: new Date().toISOString(),
            provider: 'Pollinations.ai',
          }),
        },
      });
      // Also persist to media table for relational retrieval
      try {
        const first = base64Image ? base64Image : imageUrl;
        const isData = /^data:image\//i.test(first);
        const isHttp = /^https?:\/\//i.test(first);
        const mime = isData ? (first.split(';')[0].replace('data:', '') || 'image/png') : null;
        const base64 = isData ? first.split(',')[1] : null;
        await prisma.$executeRawUnsafe(
          `INSERT INTO media (agentId, contentId, url, base64, mimeType) VALUES ($1, $2, $3, $4, $5)`,
          agentId,
          content.id,
          isHttp ? first : null,
          base64,
          mime
        );
      } catch (e: any) {
        console.warn('⚠️ Failed to insert content media row:', e?.message || e);
      }
      return { content, imageUrl, imageDataUrl: base64Image || null, usage: null };
    } catch (err: any) {
      console.error('❌ Image generation error:', err.message);
      throw new Error('Failed to generate image: ' + err.message);
    }
  }
}
