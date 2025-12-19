import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { AIMemoryService } from './ai-memory.service';

export interface CreateAgentInput {
  agentName: string;
  userId: string; // For verification
}

export class AgentService {
  static async createAgent(input: CreateAgentInput) {
    // Create agent without business
    const agent = await prisma.agent.create({
      data: {
        agentName: input.agentName
        // Omit businessId entirely if not present
      } as Prisma.AgentUncheckedCreateInput,
    });
    return agent;
  }

  static async getAgentById(agentId: string, userId: string) {
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        business: { userId },
      },
      include: {
        business: true,
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    return agent;
  }

  static async getAgentsByBusiness(businessId: string, userId: string) {
    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId },
    });

    if (!business) {
      throw new Error('Business not found');
    }

    const agents = await prisma.agent.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    return agents;
  }

  static async deleteAgent(agentId: string, userId: string) {
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

    await prisma.agent.delete({
      where: { id: agentId },
    });

    return { message: 'Agent deleted successfully' };
  }

  static async updateAgentMemory(agentId: string, userId: string) {
    // Verify ownership
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

    // Regenerate memory from updated business data, only if business exists
    if (!agent.business) {
      throw new Error('Cannot update agent memory: agent has no business');
    }
    const memoryProfile = AIMemoryService.generateMemoryProfile(agent.business);

    // Update agent memory
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: { memory: memoryProfile },
    });

    // Update embeddings
    await AIMemoryService.storeMemoryEmbedding(agentId, memoryProfile, {
      type: 'business_profile',
      businessId: agent.businessId,
    });

    return updatedAgent;
  }

  static async createEnhancedAgent(input: any) {
    const { type, basicInfo, config, userId } = input;

    // Create or find business
    let business = await prisma.business.findFirst({
      where: {
        userId,
        name: basicInfo.businessName,
      },
    });

    if (!business) {
      business = await prisma.business.create({
        data: {
          userId,
          name: basicInfo.businessName,
          industry: basicInfo.industry,
          description: basicInfo.description,
          targetAudience: basicInfo.targetAudience,
          brandTone: basicInfo.brandTone || 'professional',
        },
      });
    }

    // Create agent with enhanced config
    const agentTypeNames: Record<string, string> = {
      marketing: 'Marketing AI',
      sales: 'Sales AI',
      support: 'Support AI',
      content: 'Content Writer AI',
    };

    const memoryProfile = {
      ...basicInfo,
      type,
      config,
      createdAt: new Date().toISOString(),
    };

    const agent = await prisma.agent.create({
      data: {
        businessId: business.id,
        agentName: agentTypeNames[type] || 'AI Agent',
        memory: JSON.stringify(memoryProfile),
      },
    });

    return agent;
  }

  static async generateContent(agentId: string, params: any, userId: string) {
    const agent = await this.getAgentById(agentId, userId);
    
    // This would integrate with DeepSeek API
    // For now, return mock data
    const content = await prisma.content.create({
      data: {
        agentId,
        type: params.contentType || 'post',
        data: JSON.stringify({
          text: 'Generated content placeholder',
          prompt: params.prompt,
          keywords: params.keywords,
        }),
      },
    });

    return {
      id: content.id,
      text: 'Generated content placeholder',
      type: params.contentType,
      status: 'draft',
    };
  }

  static async postToSocialMedia(agentId: string, params: any, userId: string) {
    const agent = await this.getAgentById(agentId, userId);
    
    // This would integrate with social media APIs
    return {
      postId: 'mock_post_id',
      url: `https://${params.platform}.com/post/mock`,
    };
  }

  static async sendEmail(agentId: string, params: any, userId: string) {
    const agent = await this.getAgentById(agentId, userId);
    
    // This would integrate with SMTP
    return {
      messageId: 'mock_message_id',
    };
  }

  static async findLeads(agentId: string, params: any, userId: string) {
    const agent = await this.getAgentById(agentId, userId);
    
    // This would integrate with lead APIs
    return [
      {
        id: '1',
        name: 'Sample Lead',
        industry: params.criteria.industry,
        email: 'lead@example.com',
        score: 85,
      },
    ];
  }

  static async getAgentActivity(agentId: string, userId: string) {
    const agent = await this.getAgentById(agentId, userId);
    
    const contents = await prisma.content.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      status: 'active',
      currentTask: 'Generating content',
      progress: 0.75,
      tasksCompleted: contents.length,
      tasksToday: contents.filter(
        (c: any) =>
          new Date(c.createdAt).toDateString() === new Date().toDateString()
      ).length,
      lastActive: new Date().toISOString(),
    };
  }
}
