import React, { useEffect, useState, useRef } from 'react';
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
import { useRoute } from '@react-navigation/native';
import Colors from '../constants/Colors';
import questionImages from '../constants/QuestionImages';
import TestDataMap from '../constants/TestDataMap';

const { width } = Dimensions.get('window');

export default function QuestionScreen() {
  const route = useRoute();
  const testNumber = (route.params as { testNumber?: number })?.testNumber || 1;

  const data = TestDataMap[testNumber];
  const questions = data.questions;
  const testTitle = data.testNumber;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const animation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const image = questionImages[testNumber]?.[currentQuestionIndex] || null;
  const selectedOption = selected !== null ? shuffledOptions[selected] : null;

  useEffect(() => {
    const shuffled = [...currentQuestion.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setSelected(null);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false }); // автоскролл наверх
  }, [currentQuestionIndex, currentQuestion.options]);

  useEffect(() => {
    if (questions.length <= 1) return;
  
    Animated.timing(animation, {
      toValue: currentQuestionIndex / (questions.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, animation, questions.length]);

  const isCorrect = (option: string) => option === currentQuestion.options[currentQuestion.correct];

  const handleSelect = (index: number) => {
    if (selected === null) setSelected(index);
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

  const progressBarWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  return (
    <View style={styles.container}>
      {/* Верхняя фиксированная часть */}
      <View style={styles.fixedTop}>
        <View style={styles.testBadge}>
          <Text style={styles.testBadgeText}>Test {testTitle}</Text>
        </View>
        <Text style={styles.header}>Question №{currentQuestionIndex + 1}</Text>
        {image && <Image source={image} style={styles.image} />}
      </View>

      {/* Скроллим только вопрос и варианты ответа */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
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

      {/* Кнопки навигации */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabled]}
          onPress={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === questions.length - 1 && styles.disabled]}
          onPress={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Прогресс-бар */}
      <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fixedTop: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: Colors.background,
  },
  testBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  testBadgeText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
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
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
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
  disabled: {
    opacity: 0.4,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: Colors.primary,
  },
});
