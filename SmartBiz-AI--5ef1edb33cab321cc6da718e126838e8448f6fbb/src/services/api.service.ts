import axios, { AxiosInstance } from 'axios';
import API_CONFIG from '../config/api.config';

const API_URL = API_CONFIG.baseURL;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log('🔴 API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.response?.data?.error || error.message,
          data: error.response?.data,
        });
        
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Auth endpoints
  async register(name: string, email: string, password: string) {
    const response = await this.api.post('/auth/register', { name, email, password });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data.user;
  }

  // Business endpoints
  async createBusiness(businessData: {
    name: string;
    industry?: string;
    description?: string;
    targetAudience?: string;
    brandTone?: string;
    socialLinks?: Record<string, string>;
    logoUrl?: string;
    brandColors?: Record<string, string>;
    goals?: string[];
  }) {
    const response = await this.api.post('/business/create', businessData);
    return response.data;
  }

  async getAllBusinesses() {
    const response = await this.api.get('/business/all');
    return response.data;
  }

  async getBusinessById(businessId: string) {
    const response = await this.api.get(`/business/${businessId}`);
    return response.data;
  }

  async updateBusiness(businessId: string, businessData: any) {
    const response = await this.api.put(`/business/${businessId}/edit`, businessData);
    return response.data;
  }

  async deleteBusiness(businessId: string) {
    const response = await this.api.delete(`/business/${businessId}`);
    return response.data;
  }

  // Agent endpoints
  async createAgent(agentName: string) {
    const response = await this.api.post('/agent/create', { agentName });
    return response.data;
  }

  async getAgentById(agentId: string) {
    const response = await this.api.get(`/agent/${agentId}`);
    return response.data;
  }

  async getAgentsByBusiness(businessId: string) {
    const response = await this.api.get(`/agent/by-business/${businessId}`);
    return response.data;
  }

  async deleteAgent(agentId: string) {
    const response = await this.api.delete(`/agent/${agentId}`);
    return response.data;
  }

  async updateAgentMemory(agentId: string) {
    const response = await this.api.post(`/agent/${agentId}/update-memory`);
    return response.data;
  }

  // Chat endpoints
  async sendMessage(agentId: string, message: string, imageFile?: { uri: string; name: string; type: string }) {
    let data: any;
    let headers: any = {};
    if (imageFile) {
      // React Native: use FormData for file upload
      data = new FormData();
      data.append('message', message);
      data.append('image', {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.type,
      } as any);
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      data = { message };
    }
    const response = await this.api.post(`/agent/${agentId}/chat`, data, { headers });
    return response.data;
  }

  async getMessages(agentId: string) {
    const response = await this.api.get(`/agent/${agentId}/messages`);
    return response.data;
  }

  // Content generation endpoints
  async generateContent(agentId: string, type: string, prompt: string) {
    const response = await this.api.post(`/agent/${agentId}/content/create`, { type, prompt });
    return response.data;
  }

  async getAllContent(agentId: string) {
    const response = await this.api.get(`/agent/${agentId}/content/all`);
    return response.data;
  }
}

export const apiService = new ApiService();
