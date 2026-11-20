// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';

// Import fonts
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';

// Import Screens
import WelcomeScreen from './screens/WelcomeScreen';
import LearnerLoginScreen from './screens/LearnerLoginScreen';
import StoryReaderScreen from './screens/StoryReaderScreen';
import QuizScreen from './screens/QuizScreen';
import TeacherLoginScreen from './screens/TeacherLoginScreen';
import TeacherViewLearnerScreen from './screens/TeacherViewLearnerScreen';

// Import Navigators
import BottomTabs from './navigation/BottomTabs';
import TeacherTabs from './navigation/TeacherTabs';

// Import Context & Theme
import { SettingsProvider } from './context/SettingsContext';
import { colors } from './styles/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  // Load the custom Fredoka font
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  // If there is an error loading the font, log it so we can see why
  if (fontError) {
    console.error("Font loading error:", fontError);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', textAlign: 'center' }}>
          Failed to load fonts. Please check the console for details.
        </Text>
      </View>
    );
  }

  // Show a loading spinner while the font is loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Once fonts are loaded, render the app
  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
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