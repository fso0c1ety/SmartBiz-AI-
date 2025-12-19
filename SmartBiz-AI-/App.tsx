import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ToastContainer } from './src/components/Toast';
import { useThemeStore } from './src/store/useThemeStore';
import { useAuthStore } from './src/store/useAuthStore';

export default function App() {
  const { colorScheme } = useThemeStore();
  const { loadStoredAuth } = useAuthStore();

  useEffect(() => {
    // Load stored authentication on app start
    loadStoredAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
        <ToastContainer />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
