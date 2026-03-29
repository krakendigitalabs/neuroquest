import { requireModuleRouteAccess } from '@/modules/access/server-guards';

export default async function MedicationLayout({ children }: { children: React.ReactNode }) {
  await requireModuleRouteAccess('medication');
  return children;
}
