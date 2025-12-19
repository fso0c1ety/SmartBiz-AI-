import { useCallback } from 'react';
import { apiService } from '../services/api.service';
import { useToastStore } from '../store/useToastStore';

export const useApi = () => {
  const { showToast } = useToastStore();

  const handleError = (error: any, defaultMessage: string) => {
    const message = error.response?.data?.error || defaultMessage;
    showToast(message, 'error');
    console.error(defaultMessage, error);
  };

  // Business hooks
  const createBusiness = useCallback(
    async (businessData: any) => {
      try {
        const result = await apiService.createBusiness(businessData);
        showToast('Business created successfully!', 'success');
        return result;
      } catch (error: any) {
        handleError(error, 'Failed to create business');
        throw error;
      }
    },
    [showToast]
  );

  const getAllBusinesses = useCallback(async () => {
    try {
      return await apiService.getAllBusinesses();
    } catch (error: any) {
      handleError(error, 'Failed to fetch businesses');
      return [];
    }
  }, [showToast]);

  const getBusinessById = useCallback(
    async (businessId: string) => {
      try {
        return await apiService.getBusinessById(businessId);
      } catch (error: any) {
        handleError(error, 'Failed to fetch business');
        throw error;
      }
    },
    [showToast]
  );

  const updateBusiness = useCallback(
    async (businessId: string, businessData: any) => {
      try {
        const result = await apiService.updateBusiness(businessId, businessData);
        showToast('Business updated successfully!', 'success');
        return result;
      } catch (error: any) {
        handleError(error, 'Failed to update business');
        throw error;
      }
    },
    [showToast]
  );

  const deleteBusiness = useCallback(
    async (businessId: string) => {
      try {
        await apiService.deleteBusiness(businessId);
        showToast('Business deleted successfully!', 'success');
      } catch (error: any) {
        handleError(error, 'Failed to delete business');
        throw error;
      }
    },
    [showToast]
  );

  // Agent hooks
  const createAgent = useCallback(
    async (agentName: string) => {
      try {
        const result = await apiService.createAgent(agentName);
        showToast('Agent created successfully!', 'success');
        return result;
      } catch (error: any) {
        handleError(error, 'Failed to create agent');
        throw error;
      }
    },
    [showToast]
  );

  const getAgentsByBusiness = useCallback(
    async (businessId: string) => {
      try {
        return await apiService.getAgentsByBusiness(businessId);
      } catch (error: any) {
        handleError(error, 'Failed to fetch agents');
        return [];
      }
    },
    [showToast]
  );

  const deleteAgent = useCallback(
    async (agentId: string) => {
      try {
        await apiService.deleteAgent(agentId);
        showToast('Agent deleted successfully!', 'success');
      } catch (error: any) {
        handleError(error, 'Failed to delete agent');
        throw error;
      }
    },
    [showToast]
  );

  // Chat hooks
  const sendMessage = useCallback(
    async (agentId: string, message: string, imageBase64?: string) => {
      try {
        let imageFile;
        if (imageBase64) {
          // Convert base64 to a file object for FormData
          imageFile = {
            uri: imageBase64,
            name: `upload_${Date.now()}.jpg`,
            type: 'image/jpeg',
          };
        }
        return await apiService.sendMessage(agentId, message, imageFile);
      } catch (error: any) {
        handleError(error, 'Failed to send message');
        throw error;
      }
    },
    [showToast]
  );

  const getMessages = useCallback(
    async (agentId: string) => {
      try {
        return await apiService.getMessages(agentId);
      } catch (error: any) {
        handleError(error, 'Failed to fetch messages');
        return [];
      }
    },
    [showToast]
  );

  // Content hooks
  const generateContent = useCallback(
    async (agentId: string, type: string, prompt: string) => {
      try {
        const result = await apiService.generateContent(agentId, type, prompt);
        showToast('Content generated successfully!', 'success');
        return result;
      } catch (error: any) {
        handleError(error, 'Failed to generate content');
        throw error;
      }
    },
    [showToast]
  );

  const getAllContent = useCallback(
    async (agentId: string) => {
      try {
        return await apiService.getAllContent(agentId);
      } catch (error: any) {
        handleError(error, 'Failed to fetch content');
        return [];
      }
    },
    [showToast]
  );

  return {
    createBusiness,
    getAllBusinesses,
    getBusinessById,
    updateBusiness,
    deleteBusiness,
    createAgent,
    getAgentsByBusiness,
    deleteAgent,
    sendMessage,
    getMessages,
    generateContent,
    getAllContent,
  };
};
