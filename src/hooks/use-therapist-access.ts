'use client';

import { doc } from 'firebase/firestore';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useAdmin } from '@/hooks/use-admin';

export function useTherapistAccess() {
  const { firestore, user } = useFirebase();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const therapistDocRef = useMemoFirebase(() => {
    if (!firestore || !user || isAdmin) return null;
    return doc(firestore, 'therapists', user.uid);
  }, [firestore, isAdmin, user]);

  const { data: therapistDoc, isLoading: isTherapistLoading } = useDoc(therapistDocRef);

  const isTherapist = !!therapistDoc;
  const hasTherapistAccess = isAdmin || isTherapist;
  const isLoading = isAdminLoading || (!isAdmin && isTherapistLoading);

  return {
    hasTherapistAccess,
    isAdmin,
    isLoading,
    isTherapist,
  };
}
