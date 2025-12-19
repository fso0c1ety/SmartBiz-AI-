import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@smartbiz_token';

// Helper to get auth token
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export interface CreateEnhancedAgentPayload {
  type: 'marketing' | 'sales' | 'support' | 'content';
  basicInfo: {
    businessName: string;
    industry: string;
    description?: string;
    targetAudience?: string;
    brandTone: string;
  };
  config: MarketingConfig | SalesConfig | SupportConfig | ContentConfig;
}

export interface MarketingConfig {
  socialAccounts: {
    instagram?: { username: string; accessToken?: string; autoPost: boolean };
    tiktok?: { username: string; accessToken?: string; autoPost: boolean };
    twitter?: { username: string; accessToken?: string; autoPost: boolean };
    facebook?: { pageId: string; accessToken?: string; autoPost: boolean };
    linkedin?: { profileId: string; accessToken?: string; autoPost: boolean };
  };
  postingFrequency: 'daily' | 'twice-daily' | 'weekly';
  contentTypes: string[];
}

export interface SalesConfig {
  targetMarket: string;
  productService: string;
  priceRange?: string;
  idealCustomer: string;
  leadSources: string[];
  emailTemplate: string;
}

export interface SupportConfig {
  emailAccounts: {
    gmail?: { email: string; appPassword?: string; autoReply: boolean };
    outlook?: { email: string; appPassword?: string; autoReply: boolean };
  };
  supportCategories: string[];
  responseTime: 'immediate' | '1hour' | '24hours';
}

export interface ContentConfig {
  contentTypes: string[];
  writingStyle: string;
  seoKeywords: string;
  targetPlatforms: string[];
  contentLength: 'short' | 'medium' | 'long';
}

/**
 * Create an enhanced AI agent with role-specific configuration
 */
export const createEnhancedAgent = async (payload: CreateEnhancedAgentPayload) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_CONFIG.baseURL}/agents/enhanced`,
      payload,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    console.error('Create agent error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error || error.response?.data?.message || 'Failed to create AI agent'
    );
  }
};

/**
 * Generate content using DeepSeek API
 */
export const generateContent = async (params: {
  agentId: string;
  contentType: string;
  prompt?: string;
  keywords?: string[];
}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_CONFIG.baseURL}/agents/${params.agentId}/generate`,
      {
        contentType: params.contentType,
        prompt: params.prompt,
        keywords: params.keywords,
      },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || error.response?.data?.message || 'Failed to generate content'
    );
  }
};

/**
 * Post content to social media platforms
 */
export const postToSocialMedia = async (params: {
  agentId: string;
  platform: 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'linkedin';
  content: string;
  media?: string[]; // URLs or base64 images
}) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseURL}/agents/${params.agentId}/post`,
      {
        platform: params.platform,
        content: params.content,
        media: params.media,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to post to social media'
    );
  }
};

/**
 * Send email via agent
 */
export const sendEmail = async (params: {
  agentId: string;
  to: string;
  subject: string;
  body: string;
  isAutoReply?: boolean;
}) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseURL}/agents/${params.agentId}/email`,
      {
        to: params.to,
        subject: params.subject,
        body: params.body,
        isAutoReply: params.isAutoReply,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to send email'
    );
  }
};

/**
 * Find leads for sales agent
 */
export const findLeads = async (params: {
  agentId: string;
  criteria: {
    industry?: string;
    location?: string;
    companySize?: string;
    budget?: string;
  };
  limit?: number;
}) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseURL}/agents/${params.agentId}/leads`,
      {
        criteria: params.criteria,
        limit: params.limit || 10,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to find leads'
    );
  }
};

/**
 * Get agent activity and status
 */
export const getAgentActivity = async (agentId: string) => {
  try {
    const response = await axios.get(
      `${API_CONFIG.baseURL}/agents/${agentId}/activity`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to get agent activity'
    );
  }
};

/**
 * Get generated content history
 */
export const getGeneratedContent = async (params: {
  agentId?: string;
  type?: string;
  limit?: number;
}) => {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params.agentId) queryParams.append('agentId', params.agentId);
    if (params.type) queryParams.append('type', params.type);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await axios.get(
      `${API_CONFIG.baseURL}/content?${queryParams.toString()}`,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || error.response?.data?.message || 'Failed to get content'
    );
  }
};

/**
 * Persist media URIs for a content item
 */
export const updateContentMedia = async (params: {
  contentId: string;
  media: Array<string | { base64?: string; url?: string }>;
}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_CONFIG.baseURL}/content/${params.contentId}/media`,
      { media: params.media },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const msg = error?.response?.data?.error || error?.response?.data?.message || 'Failed to update content media';
    throw new Error(`${msg}${status ? ` (HTTP ${status})` : ''}`);
  }
};

/**
 * Persist media URIs for a message
 */
export const updateMessageMedia = async (params: {
  messageId: string;
  media: Array<string | { base64?: string; url?: string }>;
}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_CONFIG.baseURL}/agent/messages/${params.messageId}/media`,
      { media: params.media },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const msg = error?.response?.data?.error || error?.response?.data?.message || 'Failed to update message media';
    throw new Error(`${msg}${status ? ` (HTTP ${status})` : ''}`);
  }
};

/**
 * OAuth: Connect Instagram account
 */
export const connectInstagram = async (authCode: string) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseURL}/oauth/instagram`,
      { code: authCode },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to connect Instagram'
    );
  }
};

/**
 * OAuth: Connect Twitter account
 */
export const connectTwitter = async (authCode: string) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseURL}/oauth/twitter`,
      { code: authCode },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to connect Twitter'
    );
  }
};

/**
 * OAuth: Connect LinkedIn account
 */
export const connectLinkedIn = async (authCode: string) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseURL}/oauth/linkedin`,
      { code: authCode },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to connect LinkedIn'
    );
  }
};
