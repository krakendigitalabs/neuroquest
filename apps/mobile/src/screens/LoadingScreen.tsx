import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Cargando NeuroQuest...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#0f172a',
  },
  text: {
    color: '#e2e8f0',
    fontSize: 16,
  },
});
