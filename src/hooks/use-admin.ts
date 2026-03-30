'use client';

import { doc } from 'firebase/firestore';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { hasMinimumAccountRole } from '@/lib/account-role';
import { useUserProfile } from '@/hooks/use-user-profile';

export function useAdmin() {
  const { firestore, user } = useFirebase();
  const { userProfile, isLoading: isUserProfileLoading } = useUserProfile();

  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminDoc, isLoading } = useDoc(adminDocRef);

  const isAdmin = !!adminDoc || hasMinimumAccountRole(userProfile?.accountRole, 'administrator');

  return { isAdmin, isLoading: isLoading || isUserProfileLoading };
}
