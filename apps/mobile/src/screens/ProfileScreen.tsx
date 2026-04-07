import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { clearServerSession } from '../services/api';
import { useAuthStore } from '../store/auth-store';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const access = useAuthStore((state) => state.access);
  const token = useAuthStore((state) => state.token);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await clearServerSession(token).catch(() => undefined);
      await signOut(auth);
      clearSession();
    } catch (error) {
      Alert.alert('Error', `No se pudo cerrar sesión: ${String(error)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.info}>Email: {user?.email ?? 'Sin email'}</Text>
      <Text style={styles.info}>UID: {user?.uid ?? 'N/A'}</Text>
      <Text style={styles.info}>Rol acceso: {access?.role ?? 'guest'}</Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
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
  info: {
    color: '#cbd5e1',
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fee2e2',
    fontWeight: '700',
  },
});
