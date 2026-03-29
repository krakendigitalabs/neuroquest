'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { useAccountAccess } from '@/hooks/use-account-access';
import { isAllowedSuperadminEmail } from '@/lib/superadmin-config';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const { canManageWorkspaceUsers, isLoading } = useAccountAccess();
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [initializingProfile, setInitializingProfile] = useState(false);

  const email = useMemo(() => user?.email?.toLowerCase() ?? '', [user?.email]);

  const ensureSuperadminProfile = async (signedInUser: NonNullable<typeof user>) => {
    if (!firestore) {
      throw new Error('missing-firestore');
    }

    const userRef = doc(firestore, 'users', signedInUser.uid);
    const userDoc = await getDoc(userRef);

    const baseProfile = {
      id: signedInUser.uid,
      email: signedInUser.email || '',
      displayName: signedInUser.displayName || 'Superadministrador',
      photoURL: signedInUser.photoURL || '',
      userRole: 'clinic' as const,
      accountRole: 'owner' as const,
      requestedRole: 'clinic' as const,
      level: userDoc.data()?.level ?? 1,
      currentXp: userDoc.data()?.currentXp ?? 0,
      xpToNextLevel: userDoc.data()?.xpToNextLevel ?? 100,
      isAdmin: true,
      isAnonymous: false,
      therapistIds: userDoc.data()?.therapistIds ?? [],
      latestThoughtAt: userDoc.data()?.latestThoughtAt ?? null,
      latestThoughtEmotion: userDoc.data()?.latestThoughtEmotion ?? '',
      latestThoughtIntensity: userDoc.data()?.latestThoughtIntensity ?? 0,
      latestThoughtLabel: userDoc.data()?.latestThoughtLabel ?? '',
      latestThoughtPreview: userDoc.data()?.latestThoughtPreview ?? '',
      latestThoughtIsIntrusive: userDoc.data()?.latestThoughtIsIntrusive ?? false,
    };

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        ...baseProfile,
        createdAt: serverTimestamp(),
      });
      return;
    }

    await setDoc(userRef, baseProfile, { merge: true });
  };

  useEffect(() => {
    if (isUserLoading || isLoading || !user) return;

    if (isAllowedSuperadminEmail(email) && canManageWorkspaceUsers) {
      router.push('/workspace-users');
      return;
    }

    if (email && !isAllowedSuperadminEmail(email)) {
      setError('Este correo no está autorizado para superadministración.');
      void signOut(auth);
      return;
    }

    if (email && isAllowedSuperadminEmail(email) && !canManageWorkspaceUsers) {
      void (async () => {
        try {
          setInitializingProfile(true);
          setError('');
          await ensureSuperadminProfile(user);
          router.push('/workspace-users');
        } catch {
          setError('No se pudo preparar el perfil de superadministración.');
        } finally {
          setInitializingProfile(false);
        }
      })();
    }
  }, [auth, canManageWorkspaceUsers, email, firestore, isLoading, isUserLoading, router, user]);

  const handleGoogleAccess = async () => {
    if (!auth || !firestore) return;

    try {
      setSigningIn(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const signedEmail = result.user.email?.toLowerCase() ?? '';

      if (!isAllowedSuperadminEmail(signedEmail)) {
        await signOut(auth);
        setError('Este correo no está autorizado para superadministración.');
        return;
      }

      await ensureSuperadminProfile(result.user);
      router.push('/workspace-users');
    } catch {
      setError('No se pudo completar el acceso con Google.');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_25%),linear-gradient(180deg,#F7F9FC_0%,#EDF3FA_100%)] px-4 py-10 text-[#0F172A]">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1B2A41]/10 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">
            <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
            Superadmin Access
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Acceso final por Google, con correo exacto autorizado.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[#4B5563] sm:text-lg">
              El PIN ya abrió la puerta de servidor. Ahora cerramos el acceso con autenticación Google y validación exacta del correo permitido.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-[#1B2A41]/10 bg-white/86 p-5 text-sm leading-7 text-[#3A4A63] shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            Si el correo no está en la lista autorizada, la sesión se cierra y no entra al panel operativo.
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.1)] backdrop-blur-3xl sm:p-8">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-[#B8962E]">Paso 2</p>
            <h2 className="text-2xl font-semibold">Accede con Google</h2>
            <p className="text-sm leading-7 text-[#5B6474]">
              Solo entra si el correo está autorizado y además tiene rol operativo suficiente en NeuroQuest.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Button
              type="button"
              onClick={handleGoogleAccess}
              disabled={signingIn || initializingProfile}
              className="h-14 w-full rounded-2xl border-0 bg-[#1B2A41] text-white hover:bg-[#24344F]"
            >
              {signingIn || initializingProfile ? 'Validando acceso' : 'Continuar con Google'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {user?.email ? (
              <div className="rounded-2xl border border-[#1B2A41]/10 bg-[#F7F9FC] px-4 py-3 text-sm text-[#3A4A63]">
                Sesión actual: {user.email}
              </div>
            ) : null}

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
