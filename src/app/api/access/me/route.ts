import { NextResponse } from 'next/server';
import { getResolvedAccessForUser } from '@/modules/access/access.service';
import { requireServerUser } from '@/modules/auth/server-session';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const serverUser = await requireServerUser();
    const resolvedAccess = await getResolvedAccessForUser(serverUser.uid);

    return NextResponse.json(
      {
        role: resolvedAccess.role,
        visibleModules: resolvedAccess.visibleModules,
        routeAccess: resolvedAccess.routeAccess,
        actions: resolvedAccess.actions,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, no-store',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
}
