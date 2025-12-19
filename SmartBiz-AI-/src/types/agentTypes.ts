// Agent Type Definitions for Role-Specific Configuration

export type AgentType = 'marketing' | 'sales' | 'support' | 'content';

export interface BaseAgentConfig {
  businessName: string;
  industry: string;
  description: string;
  targetAudience: string;
  brandTone: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface MarketingAgentConfig extends BaseAgentConfig {
  type: 'marketing';
  socialAccounts: {
    instagram?: {
      username: string;
      accessToken?: string;
      autoPost: boolean;
      postingSchedule: string[];
    };
    tiktok?: {
      username: string;
      accessToken?: string;
      autoPost: boolean;
    };
    twitter?: {
      username: string;
      accessToken?: string;
      autoPost: boolean;
    };
    facebook?: {
      pageId: string;
      accessToken?: string;
      autoPost: boolean;
    };
    linkedin?: {
      profileId: string;
      accessToken?: string;
      autoPost: boolean;
    };
  };
  contentGoals: string[];
  postingFrequency: 'daily' | 'twice-daily' | 'weekly' | 'custom';
  contentTypes: string[];
}

export interface SalesAgentConfig extends BaseAgentConfig {
  type: 'sales';
  targetMarket: string;
  productService: string;
  priceRange: string;
  idealCustomerProfile: string;
  leadSources: string[];
  crmIntegration?: {
    platform: string;
    apiKey?: string;
  };
  emailTemplate: string;
  followUpSchedule: string[];
  qualificationCriteria: string[];
}

export interface SupportAgentConfig extends BaseAgentConfig {
  type: 'support';
  emailAccounts: {
    gmail?: {
      email: string;
      appPassword?: string;
      autoReply: boolean;
    };
    outlook?: {
      email: string;
      appPassword?: string;
      autoReply: boolean;
    };
    custom?: {
      email: string;
      smtpServer: string;
      appPassword?: string;
      autoReply: boolean;
    };
  };
  supportCategories: string[];
  responseTime: 'immediate' | '1hour' | '24hours';
  escalationRules: string[];
  knowledgeBase: string[];
}

export interface ContentAgentConfig extends BaseAgentConfig {
  type: 'content';
  contentTypes: string[];
  writingStyle: string;
  seoKeywords: string[];
  targetPlatforms: string[];
  contentLength: 'short' | 'medium' | 'long';
  publishingSchedule: string[];
}

export type AgentConfig = 
  | MarketingAgentConfig 
  | SalesAgentConfig 
  | SupportAgentConfig 
  | ContentAgentConfig;

export const AGENT_TYPES = [
  {
    id: 'marketing',
    name: 'Marketing AI',
    icon: 'megaphone',
    color: '#FF6B5B',
    description: 'Social media management, content scheduling, campaign automation',
    capabilities: [
      'Auto-post to social media',
      'Create engaging content',
      'Schedule campaigns',
      'Track engagement metrics',
    ],
  },
  {
    id: 'sales',
    name: 'Sales AI',
    icon: 'trending-up',
    color: '#FFA14A',
    description: 'Lead generation, outreach automation, CRM integration',
    capabilities: [
      'Find qualified leads',
      'Automated email outreach',
      'Lead scoring',
      'Follow-up sequences',
    ],
  },
  {
    id: 'support',
    name: 'Support AI',
    icon: 'chatbubbles',
    color: '#10B981',
    description: 'Email support, ticket management, customer queries',
    capabilities: [
      'Auto-reply to emails',
      'Categorize tickets',
      'Provide instant answers',
      'Escalate complex issues',
    ],
  },
  {
    id: 'content',
    name: 'Content AI',
    icon: 'create',
    color: '#3B82F6',
    description: 'Blog posts, articles, copywriting, SEO content',
    capabilities: [
      'Write blog posts',
      'Create ad copy',
      'SEO optimization',
      'Content calendars',
    ],
  },
] as const;
