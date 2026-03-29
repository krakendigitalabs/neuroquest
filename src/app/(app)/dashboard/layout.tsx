import { requireNonGuestAppAccess } from '@/modules/access/server-guards';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireNonGuestAppAccess();
  return children;
}
