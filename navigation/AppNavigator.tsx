import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuestionScreen from '../screens/QuestionScreen';
import Colors from '../constants/Colors'; // 👈 не забудь про палитру

export type RootStackParamList = {
  Question: { testNumber: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Question">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
