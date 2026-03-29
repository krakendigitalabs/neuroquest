'use client';

import { doc } from 'firebase/firestore';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useAdmin } from '@/hooks/use-admin';
import { useUserProfile } from '@/hooks/use-user-profile';

export function useTherapistAccess() {
  const { firestore, user } = useFirebase();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { userProfile, isLoading: isUserProfileLoading } = useUserProfile();

  const therapistDocRef = useMemoFirebase(() => {
    if (!firestore || !user || isAdmin) return null;
    return doc(firestore, 'therapists', user.uid);
  }, [firestore, isAdmin, user]);

  const { data: therapistDoc, isLoading: isTherapistLoading } = useDoc(therapistDocRef);

  const isTherapist = !!therapistDoc;
  const isProfessionalRole = userProfile?.userRole === 'professional' || userProfile?.userRole === 'clinic';
  const hasTherapistAccess = isAdmin || isTherapist || isProfessionalRole;
  const isLoading = isAdminLoading || isUserProfileLoading || (!isAdmin && isTherapistLoading);
  const isClinic = userProfile?.userRole === 'clinic';

  return {
    hasTherapistAccess,
    isAdmin,
    isClinic,
    isLoading,
    isTherapist: isTherapist || isProfessionalRole,
  };
}
