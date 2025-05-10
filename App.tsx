import React from 'react';
import { SafeAreaView } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import Colors from './constants/Colors';

export default function App() {
  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
    <AppNavigator />
  </SafeAreaView>
  );
}