'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useTranslation } from '@/context/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserRole } from '@/models/user';
import { parseRequestedRole, persistPendingRequestedRole, readPendingRequestedRole } from '@/lib/onboarding-role';

type LoginRoleCard = {
  role: UserRole;
  title: string;
  description: string;
  helper: string;
};

function SignInButton({ requestedRole }: { requestedRole: UserRole }) {
  const { auth } = useFirebase();
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!auth) return;
    persistPendingRequestedRole(requestedRole);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error during sign-in:", error);
      toast({
        variant: "destructive",
        title: t('login.signInErrorTitle'),
        description: t('login.signInErrorDescription'),
      })
    }
  };

  return <Button onClick={handleSignIn} className="w-full">{t('login.signInWithGoogle')}</Button>;
}

function GuestSignInButton({ requestedRole }: { requestedRole: UserRole }) {
    const { auth } = useFirebase();
    const { t } = useTranslation();
    const { toast } = useToast();
    const isPatientFlow = requestedRole === 'patient';

    const handleGuestSignIn = async () => {
        if (!auth || !isPatientFlow) return;
        persistPendingRequestedRole('patient');
        try {
            await signInAnonymously(auth);
        } catch (error: any) {
            console.error("Error during anonymous sign-in:", error);
            toast({
              variant: "destructive",
              title: t('login.guestSignInErrorTitle'),
              description: t('login.guestSignInErrorDescription'),
            })
        }
    };

    return (
        <Button onClick={handleGuestSignIn} variant="secondary" className="w-full" disabled={!isPatientFlow}>
            {t('login.continueAsGuest')}
        </Button>
    );
}

export default function LoginPage() {
  const { user, isUserLoading, sessionSynced } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');

  const roleCards = useMemo<LoginRoleCard[]>(
    () => [
      {
        role: 'patient',
        title: t('login.roles.patient.title'),
        description: t('login.roles.patient.description'),
        helper: t('login.roles.patient.helper'),
      },
      {
        role: 'professional',
        title: t('login.roles.professional.title'),
        description: t('login.roles.professional.description'),
        helper: t('login.roles.professional.helper'),
      },
      {
        role: 'clinic',
        title: t('login.roles.clinic.title'),
        description: t('login.roles.clinic.description'),
        helper: t('login.roles.clinic.helper'),
      },
    ],
    [t]
  );

  useEffect(() => {
    if (!isUserLoading && user && sessionSynced) {
      router.push(user.isAnonymous ? '/check-in' : '/dashboard');
    }
  }, [user, isUserLoading, sessionSynced, router]);

  useEffect(() => {
    const roleFromQuery = parseRequestedRole(searchParams.get('role'));
    const roleFromStorage = readPendingRequestedRole();
    const nextRole = roleFromQuery ?? roleFromStorage ?? 'patient';

    setSelectedRole(nextRole);
    persistPendingRequestedRole(nextRole);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-headline">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isUserLoading ? (
            <div>{t('loading')}</div>
          ) : (
            <>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{t('login.roleSectionTitle')}</p>
                  <p className="text-sm text-muted-foreground">{t('login.roleSectionDescription')}</p>
                </div>
                <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)} className="mt-4 grid gap-3 md:grid-cols-3">
                  {roleCards.map((roleCard) => (
                    <Label
                      key={roleCard.role}
                      htmlFor={`role-${roleCard.role}`}
                      className={`flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition ${
                        selectedRole === roleCard.role
                          ? 'border-primary bg-primary/5'
                          : 'border-border/70 bg-background hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id={`role-${roleCard.role}`} value={roleCard.role} />
                        <span className="font-medium text-foreground">{roleCard.title}</span>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{roleCard.description}</p>
                      <p className="text-xs leading-5 text-muted-foreground">{roleCard.helper}</p>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
                <p className="font-medium">{t(`login.accessNotes.${selectedRole}.title`)}</p>
                <p className="mt-2 leading-6">{t(`login.accessNotes.${selectedRole}.description`)}</p>
              </div>
              <SignInButton requestedRole={selectedRole} />
              <GuestSignInButton requestedRole={selectedRole} />
              {selectedRole !== 'patient' && (
                <p className="text-center text-sm text-muted-foreground">{t('login.guestOnlyPatient')}</p>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/home">{t('login.homeButton')}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
