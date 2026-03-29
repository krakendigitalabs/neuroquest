'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import type { ResolvedAccess } from '@/modules/access/access.types';

type AccessMeResponse = Pick<ResolvedAccess, 'role' | 'visibleModules' | 'routeAccess' | 'actions'>;

export function useAccessMe() {
  const { user } = useFirebase();
  const [access, setAccess] = useState<AccessMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAccess() {
      if (!user) {
        setAccess(null);
        setIsLoading(false);
        return;
      }

      try {
        let response: Response | null = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          response = await fetch('/api/access/me', {
            credentials: 'include',
            cache: 'no-store',
          });

          if (response.ok) {
            break;
          }

          if (response.status !== 401 || attempt === 2) {
            break;
          }

          await new Promise((resolve) => window.setTimeout(resolve, 250));
        }

        if (!response?.ok) {
          throw new Error('access-fetch-failed');
        }

        const data = await response.json() as AccessMeResponse;
        if (!cancelled) {
          setAccess(data);
        }
      } catch {
        if (!cancelled) {
          setAccess(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAccess();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { access, isLoading };
}
