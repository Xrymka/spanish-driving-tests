import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import questionImages from '../constants/QuestionImages';
import TestDataMap from '../constants/TestDataMap';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Answer } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');
const TOTAL_TIME = 30 * 60; // 30 minutes in seconds

export default function QuestionScreen() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const testNumber = (route.params as { testNumber?: number })?.testNumber || 1;

  const data = TestDataMap[testNumber];
  const questions = data.questions;
  const testTitle = data.testNumber;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [answers, setAnswers] = useState(
    questions.map((q: { question: string; correct: number }) => ({
      question: q.question,
      correct: q.correct,
      selected: null,
    }))
  );

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const animation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const image = questionImages[testNumber]?.[currentQuestionIndex] || null;
  const selectedOption = selected !== null ? shuffledOptions[selected] : null;
  const elapsedTime = TOTAL_TIME - timeLeft;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const shuffled = [...currentQuestion.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setSelected(answers[currentQuestionIndex].selected);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentQuestionIndex]);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: currentQuestionIndex / (questions.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex]);

  const isCorrect = (option: string) =>
    option === currentQuestion.options[currentQuestion.correct];

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex].selected = index;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const finishTest = async () => {
    const resultData = {
      date: new Date().toISOString(),
      score: answers.filter((a: Answer) => a.selected === a.correct).length,
      total: answers.length,
      elapsedTime,
      errors: answers.filter((a: Answer) => a.selected !== a.correct),
    };

    await AsyncStorage.setItem(
      `@results:test${testNumber}`,
      JSON.stringify([resultData])
    );

    navigation.navigate('Result', {
      results: answers,
      elapsedTime,
      testNumber,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const allAnswered = answers.every((a: { selected: number | null }) => a.selected !== null);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const progressBarWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  return (
    <View style={styles.container}>
      <View style={styles.fixedTop}>
        <View style={styles.rowHeader}>
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>Test {testTitle}</Text>
          </View>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        </View>
        <Text style={styles.header}>Question №{currentQuestionIndex + 1}</Text>
        {image && <Image source={image} style={styles.image} />}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {shuffledOptions.map((option, index) => {
          let backgroundColor = Colors.surface;
          if (selected !== null) {
            if (isCorrect(option)) backgroundColor = Colors.success;
            else if (option === selectedOption) backgroundColor = Colors.error;
          }

          const textColor =
            selected !== null &&
            (option === selectedOption || isCorrect(option))
              ? Colors.surface
              : Colors.text;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, { backgroundColor }]}
              onPress={() => handleSelect(index)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabled]}
          onPress={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>← Back</Text>
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity
            style={[styles.navButton, !allAnswered && styles.disabled]}
            onPress={finishTest}
            disabled={!allAnswered}
          >
            <Text style={styles.navButtonText}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  fixedTop: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 10 },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testBadge: {
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testBadgeText: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  timer: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  question: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
  option: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: { fontSize: 16, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: Colors.background,
  },
  navButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: { opacity: 0.4 },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: Colors.primary,
  },
});
