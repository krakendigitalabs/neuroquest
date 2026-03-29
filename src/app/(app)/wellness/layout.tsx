import { requireModuleRouteAccess } from '@/modules/access/server-guards';

export default async function WellnessLayout({ children }: { children: React.ReactNode }) {
  await requireModuleRouteAccess('wellness');
  return children;
}
