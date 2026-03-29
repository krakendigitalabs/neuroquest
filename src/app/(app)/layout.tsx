'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { useFirebase } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useTranslation } from '@/context/language-provider';
import { Logo } from '@/components/logo';
import { clearPendingRequestedRole, readPendingRequestedRole } from '@/lib/onboarding-role';
import type { AccountRole } from '@/lib/account-role';
import type { AppAccessRole, UserRole } from '@/models/user';

type BootstrapRole = {
  role: AppAccessRole;
  userRole: UserRole;
  accountRole: AccountRole;
  requestedRole: UserRole;
  isAdmin: boolean;
};

function resolveBootstrapRole(user: User, requestedRole: ReturnType<typeof readPendingRequestedRole>): BootstrapRole {
  const isClinicAdmin = user.email === 'krakendigitalabs@gmail.com';

  if (user.isAnonymous) {
    return {
      role: 'guest' as const,
      userRole: 'patient' as const,
      accountRole: 'viewer' as const,
      requestedRole: 'patient' as const,
      isAdmin: false,
    };
  }

  if (requestedRole === 'professional') {
    return {
      role: 'professional' as const,
      userRole: 'professional' as const,
      accountRole: 'viewer' as const,
      requestedRole: 'professional' as const,
      isAdmin: false,
    };
  }

  if (requestedRole === 'clinic' || isClinicAdmin) {
    return {
      role: 'clinic' as const,
      userRole: 'clinic' as const,
      accountRole: isClinicAdmin ? 'owner' : 'viewer',
      requestedRole: 'clinic' as const,
      isAdmin: isClinicAdmin,
    };
  }

  return {
    role: 'patient' as const,
    userRole: 'patient' as const,
    accountRole: 'viewer' as const,
    requestedRole: 'patient' as const,
    isAdmin: false,
  };
}

function UserProfileInitializer({ user }: { user: User }) {
  const { firestore } = useFirebase();
  const { t } = useTranslation();

  useEffect(() => {
    const createUserProfile = async () => {
      if (!user || !firestore) return;

      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const requestedRole = readPendingRequestedRole();
      const bootstrap = resolveBootstrapRole(user, requestedRole);
      const existingData = userDoc.exists() ? userDoc.data() : null;

      const newUserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: user.isAnonymous ? t('sidebar.guestUser') : (user.displayName || t('sidebar.anonymousUser')),
        photoURL: user.photoURL || '',
        role: bootstrap.role,
        userRole: bootstrap.userRole,
        accountRole: existingData?.accountRole ?? bootstrap.accountRole,
        requestedRole: bootstrap.requestedRole,
        pinnedPatientModules: bootstrap.role === 'patient'
          ? (existingData?.pinnedPatientModules ?? ['check-in', 'observer', 'progress'])
          : [],
        level: existingData?.level ?? 1,
        currentXp: existingData?.currentXp ?? 0,
        xpToNextLevel: existingData?.xpToNextLevel ?? 100,
        isAdmin: existingData?.isAdmin ?? bootstrap.isAdmin,
        isAnonymous: user.isAnonymous,
        createdAt: existingData?.createdAt ?? serverTimestamp(),
        therapistIds: existingData?.therapistIds ?? [],
        latestThoughtAt: existingData?.latestThoughtAt ?? null,
        latestThoughtEmotion: existingData?.latestThoughtEmotion ?? '',
        latestThoughtIntensity: existingData?.latestThoughtIntensity ?? 0,
        latestThoughtLabel: existingData?.latestThoughtLabel ?? '',
        latestThoughtPreview: existingData?.latestThoughtPreview ?? '',
        latestThoughtIsIntrusive: existingData?.latestThoughtIsIntrusive ?? false,
      };

      if (!userDoc.exists()) {
        setDocumentNonBlocking(userRef, newUserProfile, { merge: false });
      } else {
        const needsBootstrapUpdate =
          !existingData?.role ||
          !existingData?.userRole ||
          !existingData?.accountRole ||
          (bootstrap.role === 'patient' && !Array.isArray(existingData?.pinnedPatientModules)) ||
          (bootstrap.role === 'clinic' && existingData?.role !== 'clinic');

        if (needsBootstrapUpdate) {
          setDocumentNonBlocking(userRef, newUserProfile, { merge: true });
        }
      }

      clearPendingRequestedRole();
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
      <SidebarInset>
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <SidebarTrigger className="h-10 w-10 rounded-xl border border-border/70 bg-background shadow-sm" />
          <Logo className="min-w-0 flex-1" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
