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
          backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#2A2A2A',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 90 : 75,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 8,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              {focused && <View style={[styles.activeBackground, { backgroundColor: colors.primary }]} />}
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={26} color={focused ? '#FFFFFF' : color} />
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
            <View style={styles.tabIconContainer}>
              {focused && <View style={[styles.activeBackground, { backgroundColor: colors.primary }]} />}
              <Ionicons name={focused ? 'people' : 'people-outline'} size={26} color={focused ? '#FFFFFF' : color} />
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
            <View style={styles.tabIconContainer}>
              {focused && <View style={[styles.activeBackground, { backgroundColor: colors.primary }]} />}
              <Ionicons name={focused ? 'documents' : 'documents-outline'} size={26} color={focused ? '#FFFFFF' : color} />
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
            <View style={styles.tabIconContainer}>
              {focused && <View style={[styles.activeBackground, { backgroundColor: colors.primary }]} />}
              <Ionicons name={focused ? 'person' : 'person-outline'} size={26} color={focused ? '#FFFFFF' : color} />
            </View>
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  activeBackground: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});
