import { requireWorkspaceAdminAccess } from '@/modules/access/server-guards';

export default async function WorkspaceSettingsLayout({ children }: { children: React.ReactNode }) {
  await requireWorkspaceAdminAccess();
  return children;
}
