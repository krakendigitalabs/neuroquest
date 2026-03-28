'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useTranslation } from '@/context/language-provider';
import { useToast } from '@/hooks/use-toast';

function SignInButton() {
  const { auth } = useFirebase();
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!auth) return;
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

function GuestSignInButton() {
    const { auth } = useFirebase();
    const { t } = useTranslation();
    const { toast } = useToast();

    const handleGuestSignIn = async () => {
        if (!auth) return;
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
        <Button onClick={handleGuestSignIn} variant="secondary" className="w-full">
            {t('login.continueAsGuest')}
        </Button>
    );
}

export default function LoginPage() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-sm">
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
              <SignInButton />
              <GuestSignInButton />
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
