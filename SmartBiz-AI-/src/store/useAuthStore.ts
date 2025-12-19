import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api.service';

const TOKEN_KEY = '@smartbiz_token';
const USER_KEY = '@smartbiz_user';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (provider: 'google' | 'apple') => Promise<void>;
  setToken: (token: string) => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,

  setToken: (token: string) => {
    apiService.setToken(token);
    AsyncStorage.setItem(TOKEN_KEY, token);
    set({ token });
  },

  loadStoredAuth: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({
          user,
          token,
          isAuthenticated: true,
        });
        apiService.setToken(token);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result = await apiService.login(email, password);
      const user = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      };
      
      // Persist to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, result.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
      ]);
      
      set({
        user,
        isAuthenticated: true,
        token: result.token,
        isLoading: false,
      });
      apiService.setToken(result.token);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result = await apiService.register(name, email, password);
      const user = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      };
      
      // Persist to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, result.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
      ]);
      
      set({
        user,
        isAuthenticated: true,
        token: result.token,
        isLoading: false,
      });
      apiService.setToken(result.token);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    apiService.clearToken();
    set({ user: null, isAuthenticated: false, token: null });
  },

  socialLogin: async (provider: 'google' | 'apple') => {
    set({ isLoading: true });
    // Social login would be implemented with OAuth providers
    // For now, return error
    set({ isLoading: false });
    throw new Error('Social login not yet implemented');
  },
}));
