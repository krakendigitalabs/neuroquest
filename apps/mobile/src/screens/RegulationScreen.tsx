import { Pressable, StyleSheet, Text, View } from 'react-native';

const EXERCISES = [
  'Respiración 4-4-6 por 2 minutos',
  'Grounding 5-4-3-2-1',
  'Relajación muscular breve',
];

export function RegulationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Regulación Emocional</Text>
      <Text style={styles.subtitle}>Intervenciones rápidas sugeridas:</Text>
      {EXERCISES.map((item) => (
        <Pressable key={item} style={styles.card}>
          <Text style={styles.cardText}>{item}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
    borderRadius: 12,
    padding: 12,
  },
  cardText: {
    color: '#e2e8f0',
  },
});
