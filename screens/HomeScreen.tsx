import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type TestResult = {
  date: string;
  score: number;
  total: number;
  elapsedTime: number;
};

type TestMap = {
  [testNumber: number]: TestResult | null;
};

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const availableTests = [1, 2, 3];

  const [results, setResults] = useState<TestMap>({});

  useEffect(() => {
    const loadResults = async () => {
      const resultMap: TestMap = {};

      for (const num of availableTests) {
        const key = `@results:test${num}`;
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          resultMap[num] = parsed[0]; // latest result
        } else {
          resultMap[num] = null;
        }
      }

      setResults(resultMap);
    };

    loadResults();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
  };

  const handleStart = (testNumber: number) => {
    navigation.navigate('Question', { testNumber });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spanish Driving Tests</Text>

      <ScrollView contentContainerStyle={styles.testList}>
        {availableTests.map((num) => {
          const result = results[num];
          return (
            <TouchableOpacity
              key={num}
              style={styles.testButton}
              onPress={() => handleStart(num)}
            >
              <Text style={styles.testButtonTitle}>Start Test {num}</Text>
              {result ? (
                <View style={styles.resultInfo}>
                  <Text style={styles.resultText}>
                    ✅ {result.score}/{result.total} • ⏱ {formatTime(result.elapsedTime)}
                  </Text>
                  <Text style={styles.resultDate}>{formatDate(result.date)}</Text>
                </View>
              ) : (
                <Text style={styles.noResult}>Not taken yet</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    marginBottom: 20,
  },
  testList: {
    paddingBottom: 40,
  },
  testButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  testButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  resultInfo: {
    marginTop: 4,
  },
  resultText: {
    fontSize: 14,
    color: Colors.mutedText,
  },
  resultDate: {
    fontSize: 12,
    color: Colors.mutedText,
  },
  noResult: {
    fontSize: 14,
    color: Colors.mutedText,
    marginTop: 4,
  },
});
