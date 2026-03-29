import { requireModuleRouteAccess } from '@/modules/access/server-guards';

export default async function MedicalSupportLayout({ children }: { children: React.ReactNode }) {
  await requireModuleRouteAccess('medical-support');
  return children;
}
