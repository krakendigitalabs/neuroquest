import { requireModuleRouteAccess } from '@/modules/access/server-guards';

export default async function ObserverLayout({ children }: { children: React.ReactNode }) {
  await requireModuleRouteAccess('observer');
  return children;
}
