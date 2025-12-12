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
  /**
   * Chat with an AI agent
   */
  static async chat(input: ChatInput) {
    ensureProviderConfigured();

    const { agentId, message, userId } = input;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, business: { userId } },
      include: { business: true },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Check if user is requesting image generation
    const imageKeywords = /\b(generate|create|make|design|draw)\s+(a|an|the|me|my)?\s*(logo|image|picture|graphic|illustration|banner|poster|icon|photo|artwork|design)\b/i;
    const isImageRequest = imageKeywords.test(message);

    if (isImageRequest) {
      const imagePrompt = message.replace(/^(please|can you|could you|i want you to|i need you to|do that)\s+/i, '').trim();
      console.log('🎨 Image request detected:', imagePrompt);
      try {
        const imageResult = await this.generateImage({ agentId, prompt: imagePrompt, userId });

        // Store user message
        await prisma.message.create({ data: { agentId, role: 'user', message } });

        // Assistant acknowledgement
        const assistantMsg = `I've created a professional image for your brand.`;
        await prisma.message.create({ data: { agentId, role: 'assistant', message: assistantMsg } });

        return {
          message: assistantMsg,
          type: 'image',
          imageUrl: imageResult.imageUrl,
          imagePrompt,
          usage: null,
        };
      } catch (error: any) {
        console.error('❌ Image generation failed:', error.message);
        // continue to normal chat fallback
      }
    }

    // Store user message
    await prisma.message.create({ data: { agentId, role: 'user', message } });

    // Build AI context with memory
    const { systemPrompt, recentMessages } = await AIMemoryService.buildAIContext(agentId, message);

    const conversationHistory = recentMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.message,
    }));

    // Call provider
    let assistantMessage = '';
    let usage: any = null;
    try {
      const completion = await createChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
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
        await prisma.message.create({ data: { agentId, role: 'assistant', message: fallbackMessage } });
        return { message: fallbackMessage, usage: null, note: 'Served from local fallback due to provider quota/rate limit.' };
      }
      throw err;
    }

    // Detect content types and persist
    const lower = assistantMessage.toLowerCase();
    const detectors: Array<{ type: string; test: (t: string) => boolean }> = [
      { type: 'caption', test: (t) => /\bcaption\b/.test(t) || /#\w+/.test(t) },
      { type: 'post', test: (t) => /\b(post|tweet|social\s+post)\b/.test(t) },
      { type: 'email', test: (t) => /subject:\s|\bdear\b|\bbest regards\b/.test(t) },
      { type: 'blog', test: (t) => /\b(blog|introduction|outline)\b/.test(t) },
      { type: 'ad', test: (t) => /\b(ad|advertisement|cta|call to action)\b/.test(t) },
      { type: 'code', test: (t) => /```|\bfunction\b|\bconst\b|\bclass\b/.test(t) },
    ];

    let matched = detectors.find((d) => d.test(lower));
    let labeledForChat = assistantMessage;
    let cleanedForContent = assistantMessage;

    const typeLabelMap: Record<string, string> = {
      caption: 'Caption',
      post: 'Post',
      email: 'Email',
      blog: 'Blog',
      ad: 'Ad',
      code: 'Code',
    };

    const stripLeadingLabel = (text: string, label: string) => text.replace(new RegExp(`^\\s*${label}\\s*:\\s*`, 'i'), '').trim();
    const stripMetaCommentary = (text: string) => {
      // Remove common meta lines the model might add
      const lines = text.split(/\r?\n/).filter((ln) => !/(here you go|let me know|you can tweak|adjust as needed|hope this helps)/i.test(ln));
      return lines.join('\n').trim();
    };
    const extractCode = (text: string) => {
      const fenceMatch = text.match(/```[a-zA-Z0-9]*\n([\s\S]*?)```/);
      if (fenceMatch) return fenceMatch[1].trim();
      return text.trim();
    };

    const markers: Record<string, { start: string; end: string }> = {
      caption: { start: '<<CAPTION_START>>', end: '<<CAPTION_END>>' },
      post: { start: '<<POST_START>>', end: '<<POST_END>>' },
      email: { start: '<<EMAIL_START>>', end: '<<EMAIL_END>>' },
      blog: { start: '<<BLOG_START>>', end: '<<BLOG_END>>' },
      ad: { start: '<<AD_START>>', end: '<<AD_END>>' },
      code: { start: '<<CODE_START>>', end: '<<CODE_END>>' },
    };

    // Strong fallback detection to ensure markers are present
    if (!matched) {
      if (/subject:\s/i.test(assistantMessage) || /\bdear\b/i.test(assistantMessage)) {
        matched = { type: 'email', test: () => true } as any;
      } else if (/```/.test(assistantMessage)) {
        matched = { type: 'code', test: () => true } as any;
      } else if (/#\w+/.test(assistantMessage)) {
        matched = { type: 'caption', test: () => true } as any;
      } else if (/\b(post|tweet|social\s+post)\b/i.test(assistantMessage)) {
        matched = { type: 'post', test: () => true } as any;
      } else if (/\b(ad|advertisement|cta|call to action)\b/i.test(assistantMessage)) {
        matched = { type: 'ad', test: () => true } as any;
      } else if (/\b(blog|introduction|outline)\b/i.test(assistantMessage)) {
        matched = { type: 'blog', test: () => true } as any;
      }
    }

    if (matched) {
      const label = typeLabelMap[matched.type] || 'Content';
      cleanedForContent = stripLeadingLabel(assistantMessage, label);
      cleanedForContent = stripMetaCommentary(cleanedForContent);
      if (matched.type === 'code') cleanedForContent = extractCode(assistantMessage);
      const { start, end } = markers[matched.type];
      labeledForChat = `${label}:\n${start}\n${cleanedForContent}\n${end}`;
    }

    // Store assistant response (with label if detected)
    await prisma.message.create({ data: { agentId, role: 'assistant', message: labeledForChat } });

    if (matched) {
      try {
        await prisma.content.create({
          data: {
            agentId,
            type: matched.type,
            data: JSON.stringify({ prompt: 'Detected from chat reply', content: cleanedForContent, status: 'draft', generatedAt: new Date().toISOString() }),
          },
        });
      } catch (e: any) {
        console.error('Failed to persist detected content from chat:', e.message);
      }
    }

    return { message: labeledForChat, usage, detectedType: matched?.type || null };
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

    // Generate content
    let generatedContent = '';
    let usage: any = null;
    try {
      const completion = await createChatCompletion({
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\nYou are creating ${type} content. Make it professional, on-brand, and effective.`,
          },
          { role: 'user', content: contentPrompt },
        ],
        temperature: 0.8,
        maxTokens: 1500,
      });
      generatedContent = completion.content;
      // Add explicit markers to generated content for consistent parsing
      const genMarkers: Record<string, { start: string; end: string }> = {
        caption: { start: '<<CAPTION_START>>', end: '<<CAPTION_END>>' },
        post: { start: '<<POST_START>>', end: '<<POST_END>>' },
        email: { start: '<<EMAIL_START>>', end: '<<EMAIL_END>>' },
        blog: { start: '<<BLOG_START>>', end: '<<BLOG_END>>' },
        ad: { start: '<<AD_START>>', end: '<<AD_END>>' },
      };
      if (genMarkers[type]) {
        const { start, end } = genMarkers[type];
        generatedContent = `${start}\n${generatedContent}\n${end}`;
      }
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

    // Store generated content
    const content = await prisma.content.create({
      data: {
        agentId,
        type,
        data: JSON.stringify({
          prompt,
          content: generatedContent,
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

    return messages;
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

    // Transform to match frontend format
    return contents.map((content) => {
      const data = JSON.parse(content.data || '{}');
      return {
        id: content.id,
        agentId: content.agentId,
        agentName: content.agent.agentName,
        type: content.type,
        platform: data.platform,
        content: data.content || data.text || data.caption || '',
        media: data.media || [],
        status: data.status || 'draft',
        createdAt: content.createdAt.toISOString(),
        engagement: data.engagement || {},
      };
    });
  }

  /**
   * Generate AI image using external API
   * Using Pollinations.ai (free, no API key needed) or DeepSeek
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

    // Enhance prompt with business context
    const enhancedPrompt = `${prompt}. Brand: ${agent.business.name}. Style: ${agent.business.brandTone || 'professional'}`;

    try {
      // Using Pollinations.ai - free AI image generation
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size.split('x')[0]}&height=${size.split('x')[1]}&nologo=true`;

      // Store generated image reference
      const content = await prisma.content.create({
        data: {
          agentId,
          type: 'image',
          data: JSON.stringify({
            prompt: enhancedPrompt,
            imageUrl,
            size,
            businessName: agent.business.name,
            generatedAt: new Date().toISOString(),
            provider: 'Pollinations.ai',
          }),
        },
      });

      return {
        content,
        imageUrl,
        usage: null,
      };
    } catch (err: any) {
      console.error('❌ Image generation error:', err.message);
      throw new Error('Failed to generate image: ' + err.message);
    }
  }
}
