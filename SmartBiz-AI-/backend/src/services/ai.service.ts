// Utility to check if a value is a valid ContentType
function isContentType(type: any): type is ContentType {
  return ['email', 'post', 'caption', 'code', 'image'].includes(type);
}
// ...existing code...
export class AIService {
        // Controller compatibility: getMessages
        static async getMessages(agentId: string, userId?: string) {
          // Fetch all messages for the agent (optionally filter by user if needed)
          const messages = await prisma.message.findMany({
            where: { agentId },
            orderBy: { createdAt: 'asc' },
          });
          const messageIds = messages.map((m: any) => m.id);
          // Fetch all media linked to these messages
          const media = await prisma.media.findMany({
            where: { messageId: { in: messageIds } },
          });
          // Attach media to each message
          return messages.map((msg: any) => ({
            ...msg,
            media: media
              .filter((m: any) => m.messageId === msg.id)
              .map((m: any) => m.url || m.base64)
              .filter(Boolean),
          }));
        }

        // Controller compatibility: generateContent
        static async generateContent({ agentId, type, prompt, userId }: { agentId: string; type: ContentType; prompt: string; userId: string }) {
          // Find agent
          const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: { business: true },
          });
          if (!agent) throw new Error('Agent not found');
          // Generate content using AI
          const aiResult = await generateContent(type, prompt, agent);
          const contentText = typeof aiResult.content === 'string' ? aiResult.content : JSON.stringify(aiResult.content);
          // Save to Content table
          const savedContent = await prisma.content.create({
            data: {
              agentId,
              type,
              data: JSON.stringify({
                prompt,
                content: contentText,
                businessName: agent.business?.name || '',
                brandTone: agent.business?.brandTone || '',
              }),
            },
          });

          // Also persist as a chat message
          await prisma.message.create({
            data: {
              agentId,
              role: 'assistant',
              message: contentText,
              // Optionally, add type: 'content' if your schema supports it
            },
          });

          return {
            content: savedContent,
            usage: aiResult.usage ?? null,
          };
        }

        // Controller compatibility: generateImage
        static async generateImage({ agentId, prompt, userId, size }: { agentId: string; prompt: string; userId: string; size?: string }) {
          // Find agent
          const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: { business: true },
          });
          if (!agent) throw new Error('Agent not found');
          // Use Pollinations for image generation
          const imageResult = await AIService.generateImageFromText({ prompt, agent });

          // Persist as a chat message
          const chatMsg = await prisma.message.create({
            data: {
              agentId,
              role: 'assistant',
              message: imageResult.message || 'Generated image',
              // Optionally, add type: 'image' if your schema supports it
            },
          });

          // Link image in media table
          if (imageResult.media && imageResult.media.length > 0) {
            await prisma.media.create({
              data: {
                agentId,
                messageId: chatMsg.id,
                url: imageResult.media[0],
                // Optionally, set type: 'image'
              },
            });
          }

          return imageResult;
        }

        // Controller compatibility: updateContentMedia
        static async updateContentMedia({ contentId, media, userId, agentId }: { contentId: string; media: string[]; userId: string; agentId?: string }) {
          if (!agentId) throw new Error('agentId is required');
          return prisma.media.createMany({
            data: media.map((m: string) => ({ agentId, contentId, type: 'image', base64: m })),
          });
        }
    // Restore for controller compatibility
    static async updateMessageMedia({ messageId, media, userId, agentId }: { messageId: string; media: string[]; userId: string; agentId?: string }) {
      if (!agentId) throw new Error('agentId is required');
      return prisma.media.createMany({
        data: media.map(m => ({ agentId, messageId, type: 'image', base64: m })),
      });
    }

    static async getAllContent(agentId: string, userId?: string) {
      const contents = await prisma.content.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
      });
      const contentIds = contents.map((c: any) => c.id);
      const media = await prisma.media.findMany({ where: { contentId: { in: contentIds } } });
      return contents.map((c: any) => ({
        ...c,
        media: media.filter((m: any) => m.contentId === c.id).map((m: any) => m.url || m.base64).filter(Boolean),
      }));
    }

    static async getFilteredContent({ agentId, type, limit, userId }: { agentId: string; type?: string; limit?: number; userId: string }) {
      const where: any = { agentId };
      if (type) where.type = type;
      const contents = await prisma.content.findMany({ where, take: limit || 50, orderBy: { createdAt: 'desc' } });
      const contentIds = contents.map((c: any) => c.id);
      const media = await prisma.media.findMany({ where: { contentId: { in: contentIds } } });
      return contents.map((c: any) => ({
        ...c,
        media: media.filter((m: any) => m.contentId === c.id).map((m: any) => m.url || m.base64).filter(Boolean),
      }));
    }
  static classifyIntent(message: string) {
    return classifyIntent(message);
  }

    static async chat({ agentId, message, userId, image }: { agentId: string; message: string; userId: string; image?: string }) {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        include: { business: true },
      });
      if (image) {
        const base64Data = image.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        // Vision/image-to-image already persists message+media, just return result
        return await AIService.analyzeImage({ imageBuffer, prompt: message, agent });
      }
      // For text and text-to-image, persist the assistant's reply as a message
      const result = await chat(agentId, message, image);
      // Save assistant message
      const aiMsg = await prisma.message.create({
        data: {
          agentId,
          role: 'assistant',
          message: result.message,
        },
      });
      // Save media if present
      if (result.media && result.media.length > 0) {
        for (const m of result.media) {
          await prisma.media.create({
            data: {
              agentId,
              messageId: aiMsg.id,
              url: m,
            },
          });
        }
      }
      return { ...result, messageId: aiMsg.id };
    }


  // 1️⃣ Vision analysis (image understanding)
  static async analyzeImageVision(imageBuffer: Buffer, prompt?: string, brandTone?: string) {
    try {
      const base64 = imageBuffer.toString('base64');
      const imageData = `data:image/png;base64,${base64}`;
      const systemPrompt = 'You are an expert image analysis AI. Answer the user question about the image.';
      const userPrompt = prompt || 'Describe this image.';
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: imageData } }
        ] }
      ];
      const resp = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4.1',
          messages,
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );
      const answer = resp.data?.choices?.[0]?.message?.content || 'No answer generated.';
      return { message: answer, media: [], type: 'caption' };
    } catch (err) {
      return { message: 'GPT-4.1 Vision failed.', media: [], type: 'caption' };
    }
  }

  // 2️⃣ Image generation (text-to-image)
  static async generateImageFromText({ prompt, agent }: { prompt: string; agent: any }) {
    // Use Pollinations or other text-to-image API
    const enhancedPrompt = `${prompt}\nBrand: ${agent.business?.name ?? ''}\nStyle: ${agent.business?.tone ?? 'neutral'}\nNo humans unless explicitly requested.`;
    try {
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
      return {
        message: `Generated image for: ${prompt}`,
        media: [url],
        type: 'image',
      };
    } catch (err: any) {
      throw new Error('Pollinations image generation failed: ' + (err.message || err.toString()));
    }
  }

  // 3️⃣ Image editing (image-to-image with SD) - SINGLE ENTRY POINT
  static async editImageWithStableDiffusion({ imageBuffer, prompt, agent }: { imageBuffer: Buffer; prompt: string; agent: any }) {
    // 1. Resize image
    const processed = await sharp(imageBuffer)
      .resize(1024, 1024, { fit: 'cover' })
      .toBuffer();

    // 2. Upload processed image to Cloudinary (CLOUDINARY_URL is parsed automatically by SDK)
    if (!process.env.CLOUDINARY_URL) {
      throw new Error('CLOUDINARY_URL environment variable is not set.');
    }
    const filename = `sd-img2img-${Date.now()}`;
    const publicImageUrl = await uploadImageToCloudinary(processed, filename);

    // 3. Prepare prompt
    const finalPrompt = `\nPlace the SAME product into a new scene.\nPreserve shape, label, and branding as closely as possible.\nProfessional product photography.\n${prompt}\n`.trim();

    // 4. Call the Stable Diffusion API (Modelslab)
    const resp = await axios.post(
      'https://modelslab.com/api/v7/images/image-to-image',
      {
        key: process.env.STABLE_DIFFUSION_API_KEY,
        model_id: 'seedream-4.5-i2i', // Updated model, change if needed
        prompt: finalPrompt,
        init_image: publicImageUrl, // must be a public URL
        width: '1024',
        height: '1024',
        samples: '1',
        num_inference_steps: '30',
        guidance_scale: 6.5,
        strength: 0.5,
        enhance_prompt: 'yes',
        safety_checker: 'no',
        base64: 'no',
      },
      { timeout: 120000 }
    );
    // Debug: log the full response from Modelslab
    console.log('Modelslab API response:', JSON.stringify(resp.data, null, 2));
    const url = resp.data?.output?.[0];
    if (!url) {
      throw new Error('No image returned. Modelslab response: ' + JSON.stringify(resp.data));
    }
    // Persist the AI-generated message in the database
    const aiMessage = await prisma.message.create({
      data: {
        agentId: agent.id,
        role: 'assistant',
        message: 'Your product was placed into a new scene. Minor variations may occur.',
      },
    });
    // Persist the media (image URL) in the media table
    await prisma.media.create({
      data: {
        agentId: agent.id,
        messageId: aiMessage.id,
        url: url,
      },
    });
    return {
      message: aiMessage.message,
      media: [url],
      type: 'image',
      messageId: aiMessage.id,
    };
  }

  // 4️⃣ Image router (no SD logic here)
  static async analyzeImage({ imageBuffer, prompt, agent }: { imageBuffer: Buffer; prompt?: string; agent?: any }) {
    const text = (prompt || '').toLowerCase();
    const wantsEdit = /\b(generate|create|edit|put|place|background|scene|beach)\b/.test(text);
    if (wantsEdit) {
      return AIService.editImageWithStableDiffusion({ imageBuffer, prompt: prompt || '', agent });
    }
    return AIService.analyzeImageVision(imageBuffer, prompt, agent?.business?.brandTone);
  }

}

import prisma from '../config/database';
import axios from 'axios';
import sharp from 'sharp';
import { uploadImageToCloudinary } from './cloudinaryUpload';

/* ================= TYPES ================= */

export type ContentType = 'email' | 'post' | 'caption' | 'code' | 'image';

export type IntentResult = {
  intent: 'chat' | 'image' | 'content';
  type: ContentType | 'image' | 'none';
};

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

/* ================= CONFIG ================= */

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const OPENAI_MODEL = 'gpt-4.1-mini';

function checkOpenAIKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
}

/* ================= OPENAI CHAT ================= */

export async function createChatCompletion({
  messages,
  temperature,
  maxTokens,
}: {
  messages: ChatMessage[];
  temperature: number;
  maxTokens: number;
}) {
  checkOpenAIKey();

  const input = messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');


  try {
    const resp = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        input,
        temperature,
        max_output_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );


    // Fix: Extract content from the new OpenAI response format
    const output = resp.data?.output?.[0]?.content?.[0] ?? '';
    return {
      content: output,
      usage: resp.data?.usage ?? null,
    };
  } catch (err) {
    throw err;
  }
}

/* ================= INTENT ================= */

export async function classifyIntent(message: string): Promise<IntentResult> {
  try {
    const resp = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'Classify the user message. Return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: `Schema:\n{\n  "intent": "chat | image | content",\n  "type": "email | post | caption | code | image | none"\n}\n\nMessage:\n"${message}"`,
        },
      ],
      temperature: 0,
      maxTokens: 100,
    });

    const match = resp.content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found');

    return JSON.parse(match[0]);
  } catch {
    // 🔒 Hard fallback (never crash)
    return { intent: 'chat', type: 'none' };
  }
}

/* ================= IMAGE ================= */

export async function generateOpenAIImage(prompt: string): Promise<string> {
  // Use Pollinations API for image generation
  try {
    // Pollinations API: https://image.pollinations.ai/prompt/{prompt}
    // The prompt should be URL-encoded
    const encodedPrompt = encodeURIComponent(prompt);
    // You can add style/model params if needed, e.g. ?model=anything-v4.0
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    // Optionally, check if the image is generated by making a GET request
    // For now, just return the URL
    return url;
  } catch (err: any) {
    throw new Error('Pollinations image generation failed: ' + (err.message || err.toString()));
  }
}

export async function handleImage(prompt: string, agent: any) {
  // Use Pollinations for image generation
  const enhancedPrompt = `${prompt}\nBrand: ${agent.business?.name ?? ''}\nStyle: ${agent.business?.tone ?? 'neutral'}\nNo humans unless explicitly requested.`;
  try {
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    return {
      message: `Generated image for: ${prompt}`,
      media: [url],
    };
  } catch (err: any) {
    throw new Error('Pollinations image generation failed: ' + (err.message || err.toString()));
  }
}

/* ================= CONTENT ================= */

export async function handleContent(
  type: ContentType,
  message: string,
  agent: any
) {
  return createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a professional ${type} generator.\nBusiness: ${agent.business?.name ?? 'Unknown'}\nTone: ${agent.business?.brandTone ?? 'neutral'}`,
      },
      { role: 'user', content: message },
    ],
    temperature: 0.6,
    maxTokens: 800,
  });
}

export async function generateContent(
  type: ContentType,
  message: string,
  agent: any
) {
  const systemPrompt = `You are a professional ${type} generator.\nBusiness: ${agent.business?.name ?? 'Unknown'}\nTone: ${agent.business?.brandTone ?? 'neutral'}`;
  return createChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    temperature: 0.6,
    maxTokens: 800,
  });
}

/* ================= CHAT ================= */

export async function handleChat(message: string) {
  return createChatCompletion({
    messages: [{ role: 'user', content: message }],
    temperature: 0.7,
    maxTokens: 600,
  });
}

/* ================= MAIN ROUTER ================= */

export async function chat(agentId: string, message: string, image?: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { business: true },
  });

  if (!agent) throw new Error('Agent not found');

  // 1️⃣ Save user message
  const userMessage = await prisma.message.create({
    data: { agentId, role: 'user', message },
  });

  // If image is uploaded, store it in Media table linked to this message
  if (image) {
    await prisma.media.create({
      data: {
        agentId,
        messageId: userMessage.id,
        base64: image,
        mimeType: image.startsWith('data:') ? image.split(';')[0].replace('data:', '') : undefined,
      },
    });
  }

  // 2️⃣ Detect intent
  const intent = await classifyIntent(message);
  const intentStr = intent.intent?.toLowerCase?.() ?? '';
  const typeStr = intent.type?.toLowerCase?.() ?? '';

  let assistantMessage = '';
  let media: string[] = [];

  // 3️⃣ Route (ChatGPT-style)
  const wantsImage =
    intentStr === 'image' ||
    typeStr === 'image' ||
    /\b(image|picture|photo|draw|generate|render|visualize|illustration|art|graphic|logo|avatar|scene|sketch|painting|portrait|diagram|map|chart|graph|plot|infographic|design|cover|wallpaper|background|poster|banner|flyer|brochure|card|comic|cartoon|animation|mockup|blueprint|layout|concept|template)\b/i.test(message);

  if (wantsImage || intentStr === 'image') {
    if (!image) {
      // Text-to-image: no uploaded image, so generate from prompt
      const res = await handleImage(message, agent);
      assistantMessage = res.message;
      media = res.media || [];
    }
    // If image is present, AIService.chat already handled it upstream.
    // Do nothing here; handled upstream.
  } else if (intentStr === 'content' && isContentType(intent.type)) {
    const res = await handleContent(intent.type, message, agent);
    assistantMessage = typeof res.content === 'string' ? res.content : (res.content?.text ?? JSON.stringify(res.content));
    media = []; // Do NOT extract URLs from content for image
  } else if (intentStr === 'chat') {
    // Handle normal chat intent
    const res = await handleChat(message);
    assistantMessage = typeof res.content === 'string' ? res.content : (res.content?.text ?? JSON.stringify(res.content));
    media = [];
  }

  return { message: assistantMessage, media };
}
