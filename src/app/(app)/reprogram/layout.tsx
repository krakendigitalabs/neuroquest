import { requireModuleRouteAccess } from '@/modules/access/server-guards';

export default async function ReprogramLayout({ children }: { children: React.ReactNode }) {
  await requireModuleRouteAccess('reprogram');
  return children;
}
