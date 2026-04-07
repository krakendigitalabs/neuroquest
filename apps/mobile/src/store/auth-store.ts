import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from 'firebase/auth';
import type { AccessMeResponse } from '../types';

type AuthState = {
  isBootstrapping: boolean;
  token: string | null;
  user: User | null;
  access: AccessMeResponse | null;
  setBootstrapping: (value: boolean) => void;
  setSession: (payload: { token: string; user: User; access: AccessMeResponse }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isBootstrapping: true,
      token: null,
      user: null,
      access: null,
      setBootstrapping: (value) => set({ isBootstrapping: value }),
      setSession: ({ token, user, access }) => set({ token, user, access, isBootstrapping: false }),
      clearSession: () => set({ token: null, user: null, access: null, isBootstrapping: false }),
    }),
    {
      name: 'nq-mobile-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        access: state.access,
      }),
    },
  ),
);
