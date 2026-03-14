'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirebase } from '@/firebase';
import { UserProfile } from '@/models/user';

export function useUserProfile() {
  const { firestore, user } = useFirebase();

  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading, error } = useDoc<UserProfile>(userProfileRef);

  return { userProfile, isLoading, error };
}

    