import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useThemeStore } from '../store/useThemeStore';
import { BorderRadius } from '../constants/spacing';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { GeneratedContentScreen } from '../screens/GeneratedContentScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline' },
  Agents: { active: 'people', inactive: 'people-outline' },
  Content: { active: 'documents', inactive: 'documents-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const GlassTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';
  const palette = Colors[colorScheme];
  const activeGradient = ['#FF6B5B', '#FFA14A'];

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#00D4FF', '#00A8FF', '#FF6B9D', '#FF4757']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBg}
      />
      <View
        style={[
          styles.glassOverlay,
          {
            backgroundColor: isDark
              ? 'rgba(20,20,26,0.55)'
              : 'rgba(255,255,255,0.25)',
            borderColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,255,255,0.18)',
          },
        ]}
      />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key]?.options || {};
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const iconSet = ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };
          const iconName = isFocused ? iconSet.active : iconSet.inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.8}
            >
              <View style={styles.itemInner}>
                <View style={[styles.iconShell, isFocused && styles.iconShellActive]}>
                  {isFocused && (
                    <LinearGradient
                      colors={activeGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  )}
                  <Ionicons
                    name={iconName}
                    size={isFocused ? 30 : 24}
                    color={isFocused ? '#FFFFFF' : '#F0F0F0'}
                  />
                </View>
                <Text style={[styles.label, { color: isFocused ? activeGradient[0] : '#E6E6E6' }]}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={activeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressThumb}
        />
      </View>
    </View>
  );
};

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
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
  wrapper: {
    marginHorizontal: 12,
    marginBottom: Platform.OS === 'ios' ? 12 : 6,
    borderRadius: 40,
    overflow: 'hidden',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    borderWidth: 1,
  },
  tabRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 28,
  },
  itemInner: {
    alignItems: 'center',
    gap: 8,
  },
  iconShell: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  iconShellActive: {
    shadowColor: 'rgba(255,107,91,0.45)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressTrack: {
    height: 12,
    marginHorizontal: 32,
    marginBottom: 10,
    marginTop: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  progressThumb: {
    flex: 1,
    borderRadius: 12,
  },
});
