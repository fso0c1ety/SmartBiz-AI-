import prisma from '../config/database';

interface Business {
  name: string;
  industry?: string | null;
  description?: string | null;
  targetAudience?: string | null;
  brandTone?: string | null;
  socialLinks?: any;
  brandColors?: any;
  goals?: any;
}

// Safely parse JSON strings stored in SQLite
const tryParseJson = (value: any) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }
  return value || null;
};

export class AIMemoryService {
  /**
   * Generate a structured memory profile from business data
   */
  static generateMemoryProfile(business: Business): string {
    const goalsRaw = tryParseJson(business.goals);
    const socialRaw = tryParseJson(business.socialLinks);
    const colorsRaw = tryParseJson(business.brandColors);

    const goals = Array.isArray(goalsRaw) ? goalsRaw : [];
    const socialLinks = socialRaw || {};
    const brandColors = colorsRaw || {};

    return `
BUSINESS IDENTITY:
- Name: ${business.name}
- Industry: ${business.industry || 'Not specified'}
- Description: ${business.description || 'Not specified'}

TARGET AUDIENCE:
${business.targetAudience || 'Not specified'}

BRAND VOICE & TONE:
${business.brandTone || 'professional'}

BRAND COLORS:
${Object.entries(brandColors)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n') || 'Not specified'}

SOCIAL MEDIA PRESENCE:
${Object.entries(socialLinks)
  .map(([platform, link]) => `- ${platform}: ${link}`)
  .join('\n') || 'Not specified'}

BUSINESS GOALS:
${goals.map((goal: string) => `- ${goal}`).join('\n') || 'Not specified'}

IMPORTANT INSTRUCTIONS:
- When discussing tasks, action items, or things to do, structure your response to include clear action statements
- Use phrases like "I'll [action]", "I will [action]", or "Task: [action]" to make tasks extractable
- When creating content or making plans, break them down into actionable tasks
- Keep task descriptions concise and specific
`.trim();
  }

  /**
   * Generate embedding for text using OpenAI
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    // DeepSeek-only mode: use lightweight random embedding placeholder.
    return Array(1536)
      .fill(0)
      .map(() => Math.random());
  }

  /**
   * Store memory with embedding in the database
   */
  static async storeMemoryEmbedding(
    agentId: string,
    content: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      const embedding = await this.generateEmbedding(content);
      const embeddingJson = JSON.stringify(embedding);
      const metadataJson = JSON.stringify(metadata);

      // Delete old business profile memories for this agent
      if (metadata.type === 'business_profile') {
        await prisma.agentMemory.deleteMany({
          where: {
            agentId,
            metadata: { contains: '"type":"business_profile"' },
          },
        });
      }

      // Store new memory with embedding as JSON strings (SQLite safe)
      await prisma.agentMemory.create({
        data: {
          agentId,
          content,
          embedding: embeddingJson,
          metadata: metadataJson,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error storing memory embedding:', error);
      throw error;
    }
  }

  /**
   * Search for relevant memories using vector similarity
   */
  static async searchMemories(
    agentId: string,
    query: string,
    limit: number = 5
  ): Promise<Array<{ content: string; metadata: any }>> {
    try {
      // SQLite fallback: return most recent memories (no vector search)
      const memories = await prisma.agentMemory.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return memories.map((m: any) => ({
        content: m.content,
        metadata: tryParseJson(m.metadata) || {},
      }));
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }

  /**
   * Get recent conversation history
   */
  static async getRecentMessages(agentId: string, limit: number = 10) {
    const messages = await prisma.message.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse(); // Oldest to newest
  }

  /**
   * Build complete context for AI prompt
   */
  static async buildAIContext(agentId: string, userMessage: string) {
    // Get agent and business data
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { business: true },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get relevant memories through vector search
    const relevantMemories = await this.searchMemories(agentId, userMessage, 3);

    // Get recent conversation history
    const recentMessages = await this.getRecentMessages(agentId, 10);

    // Build system prompt with all context
    let businessName = '';
    let brandTone = 'professional';
    if (agent.business) {
      businessName = agent.business.name;
      brandTone = agent.business.brandTone || 'professional';
    }
    const systemPrompt = `You are ${agent.agentName}, an AI assistant for ${businessName}.

${agent.memory}

RELEVANT CONTEXT:
${relevantMemories.map((m) => m.content).join('\n\n')}

YOUR PERSONALITY:
- You are helpful, professional, and action-oriented
- You don't just say "I'll do this" - you actually DO things and confirm completion
- When asked to create/generate something, you execute immediately and show results
- You speak in ${brandTone} tone
- You are conversational and natural, not robotic

RESPONSE GUIDELINES:
1. When asked to generate/create content: Do it immediately and show the result
2. When asked to create tasks: List them clearly as bullet points or numbered items
3. Avoid phrases like "I'll create", "I will design" - instead say "Here is..." or "I've created..."
4. Be direct and actionable - show outcomes, not intentions
5. Stay in character as a professional AI assistant
6. Use the business context naturally in your responses

Example interactions:
❌ Bad: "I'll create a logo for you"
✅ Good: "I've designed a logo concept based on your brand identity. Here are the details..."

❌ Bad: "I will help you with that task"
✅ Good: "Let me break this down for you: [specific steps or results]"

❌ Bad: "I'll generate some content ideas"
✅ Good: "Here are 5 content ideas for your campaign: 1. [idea], 2. [idea]..."

Respond naturally and professionally while delivering actual value, not just promises.`;

    return {
      systemPrompt,
      recentMessages,
      agent,
    };
  }
}
