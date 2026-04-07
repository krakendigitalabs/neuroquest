import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CHECK_IN_QUESTIONS, resolveCheckInLevel } from '../constants/clinical';
import { saveMentalCheckIn } from '../services/checkin';
import { useAuthStore } from '../store/auth-store';

export function CheckInScreen() {
  const user = useAuthStore((state) => state.user);
  const [answers, setAnswers] = useState<number[]>(() => new Array(CHECK_IN_QUESTIONS.length).fill(0));
  const [submitting, setSubmitting] = useState(false);

  const score = useMemo(() => answers.reduce((sum, value) => sum + value, 0), [answers]);
  const level = useMemo(() => resolveCheckInLevel(score), [score]);

  const setAnswer = (index: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      Alert.alert('Sesión', 'No hay sesión activa.');
      return;
    }

    try {
      setSubmitting(true);
      await saveMentalCheckIn({
        userId: user.uid,
        patientName: user.displayName ?? user.email ?? 'Paciente',
        answers: CHECK_IN_QUESTIONS.map((question, index) => ({
          questionId: question.id,
          question: question.text,
          value: answers[index] ?? 0,
        })),
      });
      Alert.alert('Guardado', `Check-in guardado: ${level} (${score}/40)`);
    } catch (error) {
      Alert.alert('Error', `No se pudo guardar: ${String(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Chequeo Mental</Text>
      <Text style={styles.subtitle}>Puntaje: {score}/40 · Nivel: {level}</Text>

      {CHECK_IN_QUESTIONS.map((question, idx) => (
        <View key={question.id} style={styles.questionCard}>
          <Text style={styles.questionText}>
            {question.id}. {question.text}
          </Text>
          <View style={styles.options}>
            {[0, 1, 2, 3, 4].map((value) => (
              <Pressable
                key={`${question.id}-${value}`}
                style={[styles.option, answers[idx] === value && styles.optionActive]}
                onPress={() => setAnswer(idx, value)}
              >
                <Text style={[styles.optionText, answers[idx] === value && styles.optionTextActive]}>{value}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Pressable style={[styles.submit, submitting && styles.disabled]} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Guardando...' : 'Guardar check-in'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    color: '#a5b4fc',
    marginBottom: 8,
  },
  questionCard: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    backgroundColor: '#0b1220',
    padding: 12,
    gap: 10,
  },
  questionText: {
    color: '#e2e8f0',
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  optionActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  optionText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#052e16',
  },
  submit: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
  },
  submitText: {
    fontWeight: '700',
    color: '#1f2937',
  },
  disabled: {
    opacity: 0.6,
  },
});
