import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { clearServerSession, createServerSession, fetchAccessMe } from '../services/api';
import { useAuthStore } from '../store/auth-store';

export function useAuthBootstrap() {
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    setBootstrapping(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          await clearServerSession().catch(() => undefined);
          clearSession();
          return;
        }

        const token = await user.getIdToken(true);
        await createServerSession(token);
        const access = await fetchAccessMe(token);
        setSession({ token, user, access });
      } catch {
        clearSession();
      }
    });

    return unsubscribe;
  }, [clearSession, setBootstrapping, setSession]);
}
