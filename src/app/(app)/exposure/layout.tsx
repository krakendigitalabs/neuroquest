import { requireModuleRouteAccess } from '@/modules/access/server-guards';

export default async function ExposureLayout({ children }: { children: React.ReactNode }) {
  await requireModuleRouteAccess('exposure');
  return children;
}
