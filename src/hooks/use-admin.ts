'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';

export function useAdmin() {
  const { firestore, user } = useFirebase();

  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminDoc, isLoading } = useDoc(adminDocRef);

  const isAdmin = !!adminDoc;

  return { isAdmin, isLoading };
}
