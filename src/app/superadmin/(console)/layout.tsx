import { SuperadminConsoleShell } from '@/components/superadmin/console-shell';
import { requireSuperadminAccess } from '@/modules/superadmin/server-guards';

export default async function SuperadminConsoleLayout({ children }: { children: React.ReactNode }) {
  await requireSuperadminAccess();

  return <SuperadminConsoleShell>{children}</SuperadminConsoleShell>;
}
