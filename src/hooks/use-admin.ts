'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirebase } from '@/firebase';

export function useAdmin() {
  const { firestore, user } = useFirebase();

  const adminDocRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminDoc, isLoading } = useDoc(adminDocRef);

  const isAdmin = !!adminDoc;

  return { isAdmin, isLoading };
}

    