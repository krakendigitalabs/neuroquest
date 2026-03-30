import { requireModuleRouteAccess } from '@/modules/access/server-guards';

export default async function RegulationLayout({ children }: { children: React.ReactNode }) {
  await requireModuleRouteAccess('regulation');
  return children;
}
