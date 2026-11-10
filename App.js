// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { ActivityIndicator, View } from 'react-native';

import WelcomeScreen from './screens/WelcomeScreen';
import LearnerLoginScreen from './screens/LearnerLoginScreen';
import StoryReaderScreen from './screens/StoryReaderScreen';
import QuizScreen from './screens/QuizScreen';
import BottomTabs from './navigation/BottomTabs';
import TeacherLoginScreen from './screens/TeacherLoginScreen';
import TeacherTabs from './navigation/TeacherTabs';
import TeacherViewLearnerScreen from './screens/TeacherViewLearnerScreen';

import { SettingsProvider } from './context/SettingsContext'; // <-- Import
import { colors } from './styles/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LearnerLoginScreen} />
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="StoryReader" component={StoryReaderScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          
          <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
          <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
          <Stack.Screen name="TeacherViewLearner" component={TeacherViewLearnerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}