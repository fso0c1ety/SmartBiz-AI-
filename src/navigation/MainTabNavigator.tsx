import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/useThemeStore';
import { BorderRadius, Spacing } from '../constants/spacing';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { GeneratedContentScreen } from '../screens/GeneratedContentScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0, 212, 255, 0.2)',
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          marginHorizontal: 12,
          marginBottom: Platform.OS === 'ios' ? 8 : 4,
          borderRadius: 40,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['#00D4FF', '#00A8FF', '#FF6B9D', '#FF4757']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        ),
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              {focused && (
                <LinearGradient
                  colors={['#FF6B5B', '#FFA14A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeIconBg}
                />
              )}
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
            </View>
          ),
          tabBarLabel: 'Dashboard',
        }}
      />
      
      <Tab.Screen
        name="Agents"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              {focused && (
                <LinearGradient
                  colors={['#FF6B5B', '#FFA14A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeIconBg}
                />
              )}
              <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
            </View>
          ),
          tabBarLabel: 'Agents',
        }}
      />
      
      <Tab.Screen
        name="Content"
        component={GeneratedContentScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              {focused && (
                <LinearGradient
                  colors={['#FF6B5B', '#FFA14A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeIconBg}
                />
              )}
              <Ionicons name={focused ? 'documents' : 'documents-outline'} size={size} color={color} />
            </View>
          ),
          tabBarLabel: 'Content',
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              {focused && (
                <LinearGradient
                  colors={['#FF6B5B', '#FFA14A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeIconBg}
                />
              )}
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            </View>
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBg: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
  },
});
