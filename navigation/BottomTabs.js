// navigation/BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../styles/theme';

import HomeDashboardScreen from '../screens/HomeDashboardScreen'; // <-- New Import
import HomeScreen from '../screens/HomeScreen'; // This is now the Library
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs({ route }) {
  const { learnerId, learnerName } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, height: 64, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: typography.tiny, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Library') iconName = focused ? 'book' : 'book-outline'; // Changed to Library
          else if (route.name === 'Progress') iconName = focused ? 'trending-up' : 'trending-up-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeDashboardScreen} initialParams={{ learnerId, learnerName }} />
      <Tab.Screen name="Library" component={HomeScreen} initialParams={{ learnerId, learnerName }} />
      <Tab.Screen name="Progress" component={ProgressScreen} initialParams={{ learnerId }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ learnerId, learnerName }} />
    </Tab.Navigator>
  );
}