'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { User } from 'firebase/auth';

function UserProfileInitializer({ user }: { user: User }) {
  const { firestore } = useFirebase();

  useEffect(() => {
    const createUserProfile = async () => {
      if (!user || !firestore) return;
      
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const newUserProfile = {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Anonymous User',
          photoURL: user.photoURL || '',
          level: 1,
          currentXp: 0,
          xpToNextLevel: 100,
          isAdmin: user.email === 'krakendigitalabs@gmail.com',
          createdAt: serverTimestamp(),
          therapistIds: [],
        };
        setDocumentNonBlocking(userRef, newUserProfile, { merge: false });
      }
    };

    createUserProfile();
  }, [user, firestore]);

  return null;
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }
  
  if (!user) {
    // This will be briefly visible before the redirect, or you can return a spinner
    return <div>Redirecting to login...</div>;
  }


  return (
    <SidebarProvider>
      <UserProfileInitializer user={user} />
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

    