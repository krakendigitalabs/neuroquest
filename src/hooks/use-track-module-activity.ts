'use client';

import { useEffect } from 'react';
import type { Firestore } from 'firebase/firestore';
import type { ProgressModuleKey } from '@/models/progress-event';
import { logProgressEventNonBlocking } from '@/lib/progress-events';

type Input = {
  firestore: Firestore | null | undefined;
  userId: string | null | undefined;
  module: ProgressModuleKey;
};

export function useTrackModuleActivity({ firestore, userId, module }: Input) {
  useEffect(() => {
    if (!firestore || !userId || typeof window === 'undefined') return;

    const dateKey = new Date().toISOString().slice(0, 10);
    const storageKey = `nq-module-open:${userId}:${module}:${dateKey}`;

    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, '1');
    logProgressEventNonBlocking(firestore, {
      userId,
      module,
      type: 'opened',
    });
  }, [firestore, module, userId]);
}
