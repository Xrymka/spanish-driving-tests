import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import QuestionScreen from '../screens/QuestionScreen';
import ResultScreen from '../screens/ResultScreen';
import Colors from '../constants/Colors';

export type Answer = {
  question: string;
  selected: number | null;
  correct: number;
};

export type RootStackParamList = {
  Question: { testNumber: number };
  Result: { results: Answer[], elapsedTime: number, testNumber: number };
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Spanish Driving Tests',
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: { color: Colors.text },
            headerTintColor: Colors.primary,
          }}
        />
        <Stack.Screen
          name="Question"
          component={QuestionScreen}
          options={{
            title: 'Spanish Driving Tests',
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: { color: Colors.text },
            headerTintColor: Colors.primary,
          }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{
            title: 'Spanish Driving Tests',
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: { color: Colors.text },
            headerTintColor: Colors.primary,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
