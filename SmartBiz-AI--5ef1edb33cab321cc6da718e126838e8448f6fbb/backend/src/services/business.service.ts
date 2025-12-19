import prisma from '../config/database';

export interface CreateBusinessInput {
  userId: string;
  name: string;
  industry?: string;
  description?: string;
  targetAudience?: string;
  brandTone?: string;
  socialLinks?: Record<string, string>;
  logoUrl?: string;
  brandColors?: Record<string, string>;
  goals?: string[];
}

export interface UpdateBusinessInput {
  name?: string;
  industry?: string;
  description?: string;
  targetAudience?: string;
  brandTone?: string;
  socialLinks?: Record<string, string>;
  logoUrl?: string;
  brandColors?: Record<string, string>;
  goals?: string[];
}

export class BusinessService {
  static async createBusiness(input: CreateBusinessInput) {
    // Serialize JSON-like fields because SQLite stores them as strings
    const socialLinks = input.socialLinks
      ? JSON.stringify(input.socialLinks)
      : null;
    const brandColors = input.brandColors
      ? JSON.stringify(input.brandColors)
      : null;
    const goals = input.goals ? JSON.stringify(input.goals) : null;

    const business = await prisma.business.create({
      data: {
        userId: input.userId,
        name: input.name,
        industry: input.industry,
        description: input.description,
        targetAudience: input.targetAudience,
        brandTone: input.brandTone || 'professional',
        socialLinks,
        logoUrl: input.logoUrl,
        brandColors,
        goals,
      },
    });

    return business;
  }

  static async getAllBusinesses(userId: string) {
    const businesses = await prisma.business.findMany({
      where: { userId },
      include: {
        agents: {
          select: {
            id: true,
            agentName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return businesses;
  }

  static async getBusinessById(businessId: string, userId: string) {
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId },
      include: {
        agents: {
          select: {
            id: true,
            agentName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!business) {
      throw new Error('Business not found');
    }

    return business;
  }

  static async updateBusiness(
    businessId: string,
    userId: string,
    input: UpdateBusinessInput
  ) {
    // Verify ownership
    const existing = await prisma.business.findFirst({
      where: { id: businessId, userId },
    });

    if (!existing) {
      throw new Error('Business not found');
    }

    // Serialize optional JSON-like fields when present
    const data: any = { ...input };

    if (input.socialLinks !== undefined) {
      data.socialLinks = input.socialLinks
        ? JSON.stringify(input.socialLinks)
        : null;
    }

    if (input.brandColors !== undefined) {
      data.brandColors = input.brandColors
        ? JSON.stringify(input.brandColors)
        : null;
    }

    if (input.goals !== undefined) {
      data.goals = input.goals ? JSON.stringify(input.goals) : null;
    }

    const business = await prisma.business.update({
      where: { id: businessId },
      data,
    });

    return business;
  }

  static async deleteBusiness(businessId: string, userId: string) {
    // Verify ownership
    const existing = await prisma.business.findFirst({
      where: { id: businessId, userId },
    });

    if (!existing) {
      throw new Error('Business not found');
    }

    await prisma.business.delete({
      where: { id: businessId },
    });

    return { message: 'Business deleted successfully' };
  }
}
