import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/firebase/admin';
import { isAllowedSuperadminEmail } from '@/lib/superadmin-config';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'missing-token' }, { status: 400 });
    }

    const decodedToken = await getAdminAuth().verifyIdToken(token, true);
    const email = decodedToken.email?.toLowerCase() ?? '';

    if (!isAllowedSuperadminEmail(email)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const db = getAdminDb();
    const userRef = db.collection('users').doc(decodedToken.uid);
    const adminRef = db.collection('roles_admin').doc(decodedToken.uid);
    const userSnap = await userRef.get();
    const existingData = userSnap.exists ? userSnap.data() : null;

    await adminRef.set(
      {
        grantedAt: existingData?.grantedAt ?? FieldValue.serverTimestamp(),
        source: 'superadmin-bootstrap',
      },
      { merge: true }
    );

    await userRef.set(
      {
        id: decodedToken.uid,
        email,
        displayName: decodedToken.name || existingData?.displayName || 'Superadministrador',
        photoURL: decodedToken.picture || existingData?.photoURL || '',
        role: 'clinic',
        userRole: 'clinic',
        accountRole: 'owner',
        requestedRole: 'clinic',
        pinnedPatientModules: [],
        level: existingData?.level ?? 1,
        currentXp: existingData?.currentXp ?? 0,
        xpToNextLevel: existingData?.xpToNextLevel ?? 100,
        isAdmin: true,
        isAnonymous: false,
        therapistIds: existingData?.therapistIds ?? [],
        latestThoughtAt: existingData?.latestThoughtAt ?? null,
        latestThoughtEmotion: existingData?.latestThoughtEmotion ?? '',
        latestThoughtIntensity: existingData?.latestThoughtIntensity ?? 0,
        latestThoughtLabel: existingData?.latestThoughtLabel ?? '',
        latestThoughtPreview: existingData?.latestThoughtPreview ?? '',
        latestThoughtIsIntrusive: existingData?.latestThoughtIsIntrusive ?? false,
        createdAt: existingData?.createdAt ?? FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'bootstrap-failed' }, { status: 401 });
  }
}
