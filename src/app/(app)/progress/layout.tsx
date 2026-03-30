import { requireModuleRouteAccess } from '@/modules/access/server-guards';

export default async function ProgressLayout({ children }: { children: React.ReactNode }) {
  await requireModuleRouteAccess('progress');
  return children;
}
