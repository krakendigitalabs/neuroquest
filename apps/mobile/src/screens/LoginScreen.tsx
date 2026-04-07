import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_ANDROID_CLIENT_ID,
  });

  const googleEnabled = useMemo(
    () =>
      Boolean(
        process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID ||
          process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_IOS_CLIENT_ID ||
          process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_ANDROID_CLIENT_ID,
      ),
    [],
  );

  useEffect(() => {
    const signInGoogle = async () => {
      if (response?.type !== 'success') return;
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        Alert.alert('Error', 'Google no devolvió token válido.');
        return;
      }
      try {
        setLoading(true);
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } catch (error) {
        Alert.alert('Error', `No se pudo iniciar con Google: ${String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    void signInGoogle();
  }, [response]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Ingresa correo y contraseña.');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      Alert.alert('Error', `Login inválido: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NeuroQuest Mobile</Text>
      <Text style={styles.subtitle}>Acceso clínico seguro</Text>

      <TextInput
        placeholder="Correo"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#94a3b8"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable style={[styles.button, loading && styles.disabled]} disabled={loading} onPress={handleEmailLogin}>
        <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Entrar con correo'}</Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, (!request || !googleEnabled || loading) && styles.disabled]}
        disabled={!request || !googleEnabled || loading}
        onPress={() => promptAsync()}
      >
        <Text style={styles.secondaryButtonText}>Entrar con Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
    color: '#f8fafc',
    backgroundColor: '#111827',
  },
  button: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#052e16',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
