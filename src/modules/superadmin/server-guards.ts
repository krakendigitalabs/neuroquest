import { redirect } from 'next/navigation';
import { requireSuperadminServerUser } from '@/modules/superadmin/server-session';

export async function requireSuperadminAccess() {
  try {
    return await requireSuperadminServerUser();
  } catch {
    redirect('/superadmin');
  }
}
