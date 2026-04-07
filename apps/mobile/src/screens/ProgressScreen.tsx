import { StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../store/auth-store';

export function ProgressScreen() {
  const role = useAuthStore((state) => state.access?.role ?? 'guest');
  const modules = useAuthStore((state) => state.access?.visibleModules ?? []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progreso</Text>
      <Text style={styles.text}>Rol actual: {role}</Text>
      <Text style={styles.text}>Módulos visibles: {modules.join(', ') || 'ninguno'}</Text>
      <Text style={styles.helper}>Próximo paso: sincronizar métricas históricas y gráficos desde backend.</Text>
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
  text: {
    color: '#cbd5e1',
  },
  helper: {
    color: '#94a3b8',
    marginTop: 8,
  },
});
