import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/useThemeStore';
import { BorderRadius, Spacing } from '../constants/spacing';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ContentFeedScreen } from '../screens/ContentFeedScreen';
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
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: Platform.OS === 'ios' ? 92 : 76,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={{ flex: 1 }}>
              <LinearGradient
                colors={colorScheme === 'dark' ? ['rgba(15,23,42,0.6)', 'rgba(30,41,59,0.6)'] : ['rgba(14,165,233,0.35)', 'rgba(59,130,246,0.35)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            </BlurView>
          ) : (
            <LinearGradient
              colors={colorScheme === 'dark' ? ['#0F172A', '#1E293B'] : ['#0EA5E9', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          )
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#A7B0BF' : '#E5E7EB',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.3,
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
        component={ContentFeedScreen}
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
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
});
