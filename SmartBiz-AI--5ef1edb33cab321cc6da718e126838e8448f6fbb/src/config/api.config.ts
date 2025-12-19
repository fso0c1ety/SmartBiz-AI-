/**
 * API Configuration for Development and Production
 * 
 * Development: Local backend or Expo tunnel
 * Production: Cloud-hosted backend (Render, Railway, etc.)
 */

import Constants from 'expo-constants';

// Determine if running in development mode
const isDevelopment = __DEV__;

// Get API URL based on environment
const getApiUrl = (): string => {
  // Try environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Development URLs (choose one based on your setup)
  if (isDevelopment) {
    // Using deployed Render backend for testing
    return 'https://smartbiz-ai.onrender.com/api';
    
    // Option 1: Local machine IP (for physical device/emulator)
    // return 'http://192.168.0.27:5001/api';
    
    // Option 2: localhost (for iOS simulator/Android emulator only)
    // return 'http://localhost:5001/api';
    
    // Option 3: ngrok tunnel (for local testing on real device)
    // return 'https://xxxx-xx-xxx-xx-x.ngrok.io/api';
  }

  // Production URL (replace with your deployed backend)
  // Option 1: Render (Free tier)
  return 'https://smartbiz-ai.onrender.com/api';
  
  // Option 2: Railway (Paid)
  // return 'https://smartbiz-ai-railway.up.railway.app/api';
  
  // Option 3: Custom domain
  // return 'https://api.smartbiz.com/api';
};

export const API_CONFIG = {
  // Main API URL
  baseURL: getApiUrl(),
  
  // API timeout (120 seconds for long AI responses)
  timeout: 120000,
  
  // Retry configuration
  maxRetries: 3,
  retryDelay: 1000,
  
  // Environment info
  isDevelopment,
  isProduction: !isDevelopment,
};

// Log API configuration in development
if (isDevelopment) {
  console.log('🔌 API Configuration:', {
    baseURL: API_CONFIG.baseURL,
    environment: 'DEVELOPMENT',
    timeout: API_CONFIG.timeout,
  });
} else {
  console.log('🚀 API Configuration:', {
    baseURL: API_CONFIG.baseURL,
    environment: 'PRODUCTION',
  });
}

export default API_CONFIG;
