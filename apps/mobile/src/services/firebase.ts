import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authSingleton = getAuth(app);
try {
  authSingleton = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  authSingleton = getAuth(app);
}

export const firebaseApp = app;
export const auth = authSingleton;
export const firestore = getFirestore(app);
