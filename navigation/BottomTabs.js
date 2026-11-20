// navigation/BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../styles/theme';
import { Image } from 'react-native';

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
          if (route.name === 'Library' || route.name === 'Stories') {
            return (
              <Image 
                source={require('../assets/images/owl.png')} 
                style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }} 
                resizeMode="contain" 
              />
            );
          }
      })}
    >
      <Tab.Screen name="Home" component={HomeDashboardScreen} initialParams={{ learnerId, learnerName }} />
      <Tab.Screen name="Library" component={HomeScreen} initialParams={{ learnerId, learnerName }} />
      <Tab.Screen name="Progress" component={ProgressScreen} initialParams={{ learnerId }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ learnerId, learnerName }} />
    </Tab.Navigator>
  );
}