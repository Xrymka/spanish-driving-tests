import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ResultRouteParams = {
  results: {
    question: string;
    selected: number | null;
    correct: number;
  }[];
  elapsedTime: number;
  testNumber: number;
};

export default function ResultScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { results, elapsedTime, testNumber } = route.params as ResultRouteParams;

  const correctCount = results.filter(
    (res) => res.selected === res.correct
  ).length;
  const total = results.length;
  const incorrectAnswers = results.filter((res) => res.selected !== res.correct);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const saveToStorage = async () => {
      try {
        const key = `@results:test${testNumber}`;
        const stored = await AsyncStorage.getItem(key);
        const parsed = stored ? JSON.parse(stored) : [];

        const newResult = {
          date: new Date().toISOString(),
          score: correctCount,
          total,
          elapsedTime,
          errors: incorrectAnswers,
        };

        await AsyncStorage.setItem(key, JSON.stringify([newResult, ...parsed]));
      } catch (e) {
        console.error('Error saving result:', e);
      }
    };

    saveToStorage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Result</Text>
      <Text style={styles.score}>
        Correct: {correctCount} / {total}
      </Text>
      <Text style={styles.time}>Time: {formatTime(elapsedTime)}</Text>

      <ScrollView style={styles.scroll}>
        {incorrectAnswers.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>
              Your answer: {item.selected !== null ? item.selected + 1 : 'None'}
            </Text>
            <Text style={styles.correct}>Correct answer: {item.correct + 1}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  score: {
    fontSize: 20,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: 'center',
    marginBottom: 20,
  },
  scroll: {
    flex: 1,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  answer: {
    fontSize: 14,
    color: Colors.error,
  },
  correct: {
    fontSize: 14,
    color: Colors.success,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
