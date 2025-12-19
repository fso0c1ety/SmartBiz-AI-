import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/useAuthStore';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';

// Screens
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { SetupBusinessScreen } from '../screens/SetupBusinessScreen';
import { SelectAgentScreen } from '../screens/SelectAgentScreen';
import { CreateAgentScreen } from '../screens/CreateAgentScreen';

import { AgentWorkspaceScreen } from '../screens/AgentWorkspaceScreen';
import { ContentGeneratorScreen } from '../screens/ContentGeneratorScreen';
import { ContentFeedScreen } from '../screens/ContentFeedScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AIInsightsScreen } from '../screens/AIInsightsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
          cardStyleInterpolator: ({ current }: any) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen 
              name="SetupBusiness" 
              component={SetupBusinessScreen}
            />
            <Stack.Screen 
              name="SelectAgent" 
              component={SelectAgentScreen}
            />
            <Stack.Screen 
              name="CreateAgent" 
              component={CreateAgentScreen}
              options={{
                presentation: 'modal',
              }}
            />

            <Stack.Screen 
              name="AgentWorkspace" 
              component={AgentWorkspaceScreen}
            />
            <Stack.Screen 
              name="ContentGenerator" 
              component={ContentGeneratorScreen}
              options={{
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="ContentFeed" 
              component={ContentFeedScreen}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
            />
            <Stack.Screen 
              name="AIInsights" 
              component={AIInsightsScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
