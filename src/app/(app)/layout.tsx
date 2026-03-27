'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useTranslation } from '@/context/language-provider';

function UserProfileInitializer({ user }: { user: User }) {
  const { firestore } = useFirebase();
  const { t } = useTranslation();

  useEffect(() => {
    const createUserProfile = async () => {
      if (!user || !firestore) return;

      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const newUserProfile = {
          id: user.uid,
          email: user.email || '',
          displayName: user.isAnonymous ? t('sidebar.guestUser') : (user.displayName || t('sidebar.anonymousUser')),
          photoURL: user.photoURL || '',
          level: 1,
          currentXp: 0,
          xpToNextLevel: 100,
          isAdmin: user.email === 'krakendigitalabs@gmail.com',
          isAnonymous: user.isAnonymous,
          createdAt: serverTimestamp(),
          therapistIds: [],
          latestCheckInScore: 0,
          latestCheckInLevel: 'healthy',
          latestCheckInAt: null,
          latestCheckInNote: '',
          latestThoughtAt: null,
          latestThoughtEmotion: '',
          latestThoughtIntensity: 0,
          latestThoughtLabel: '',
          latestThoughtPreview: '',
          latestThoughtIsIntrusive: false,
        };
        setDocumentNonBlocking(userRef, newUserProfile, { merge: false });
      }
    };

    createUserProfile();
  }, [user, firestore, t]);

  return null;
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <div>{t('layout.loading')}</div>;
  }
  
  if (!user) {
    return <div>{t('layout.redirecting')}</div>;
  }


  return (
    <SidebarProvider>
      <UserProfileInitializer user={user} />
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
