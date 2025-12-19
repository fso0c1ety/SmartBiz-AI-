import { useCallback } from 'react';
import { apiService } from '../services/api.service';
import { useToastStore } from '../store/useToastStore';

export const useAuth = () => {
  const { addToast } = useToastStore();

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const result = await apiService.register(name, email, password);
        addToast('Account created successfully!', 'success');
        return result;
      } catch (error: any) {
        const message = error.response?.data?.error || 'Registration failed';
        addToast(message, 'error');
        throw error;
      }
    },
    [addToast]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await apiService.login(email, password);
        addToast('Logged in successfully!', 'success');
        return result;
      } catch (error: any) {
        const message = error.response?.data?.error || 'Login failed';
        addToast(message, 'error');
        throw error;
      }
    },
    [addToast]
  );

  const logout = useCallback(() => {
    apiService.clearToken();
    addToast('Logged out', 'success');
  }, [addToast]);

  return { register, login, logout };
};
