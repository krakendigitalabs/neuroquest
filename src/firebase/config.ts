const env = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

export const firebaseConfig = {
  projectId: env.projectId || 'studio-3083535459-c0472',
  appId: env.appId || '1:722909026858:web:bee45467f78d760bea4153',
  apiKey: env.apiKey || 'AIzaSyC4vMUPG2wIV5FCmgmmwbCZdR4s1BxEMDc',
  authDomain: env.authDomain || 'studio-3083535459-c0472.firebaseapp.com',
  measurementId: env.measurementId || 'G-41GJKG6YG4',
  messagingSenderId: env.messagingSenderId || '722909026858',
  storageBucket: env.storageBucket || 'studio-3083535459-c0472.firebasestorage.app',
};
