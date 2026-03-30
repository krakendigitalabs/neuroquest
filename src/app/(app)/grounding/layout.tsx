import { requireModuleRouteAccess } from '@/modules/access/server-guards';

export default async function GroundingLayout({ children }: { children: React.ReactNode }) {
  await requireModuleRouteAccess('grounding');
  return children;
}
