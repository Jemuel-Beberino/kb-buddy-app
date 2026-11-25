// navigation/BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../styles/theme';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- ADDED

import HomeDashboardScreen from '../screens/HomeDashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs({ route }) {
  const { learnerId, learnerName } = route.params || {};
  const insets = useSafeAreaInsets(); // <-- GET PHONE INSETS

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { 
          backgroundColor: colors.surface, 
          borderTopWidth: 1, 
          borderTopColor: colors.border, 
          height: 64 + insets.bottom, // <-- ADDED INSETS
          paddingBottom: 8 + insets.bottom, // <-- ADDED INSETS
          paddingTop: 8 
        },
        tabBarLabelStyle: { fontSize: typography.tiny, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Library') {
            return (
              <Image 
                source={require('../assets/images/owl.png')} 
                style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }} 
                resizeMode="contain" 
              />
            );
          } else if (route.name === 'Home') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          } else if (route.name === 'Progress') {
            return <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
          }
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