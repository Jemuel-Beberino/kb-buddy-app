// navigation/TeacherTabs.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../styles/theme';

import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import TeacherAuthorScreen from '../screens/TeacherAuthorScreen';
const PlaceholderScreen = () => null; 

const Tab = createBottomTabNavigator();

export default function TeacherTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 64, paddingBottom: 8, paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: typography.tiny, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Author') {
            iconName = focused ? 'create' : 'create-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={TeacherDashboardScreen} />
      <Tab.Screen name="Author" component={TeacherAuthorScreen} />
    </Tab.Navigator>
  );
}