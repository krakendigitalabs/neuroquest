import { MODULE_CATALOG_FALLBACK } from '@/modules/access/module-catalog';
import type { ModuleCatalogEntry, ModuleKey } from '@/modules/access/access.types';

const MODULE_KEY_SET = new Set<ModuleKey>(MODULE_CATALOG_FALLBACK.map((entry) => entry.key));

export function mergeModuleCatalogWithFallback(
  docs: Array<Partial<Omit<ModuleCatalogEntry, 'key'>> & { key?: string }>
): ModuleCatalogEntry[] {
  const byKey = new Map<ModuleKey, Partial<Omit<ModuleCatalogEntry, 'key'>>>();

  for (const doc of docs) {
    const rawKey = typeof doc.key === 'string' ? doc.key : null;
    if (!rawKey || !MODULE_KEY_SET.has(rawKey as ModuleKey)) continue;
    byKey.set(rawKey as ModuleKey, doc);
  }

  return MODULE_CATALOG_FALLBACK.map((fallback) => {
    const fromDb = byKey.get(fallback.key);
    return {
      ...fallback,
      name: typeof fromDb?.name === 'string' ? fromDb.name : fallback.name,
      route: typeof fromDb?.route === 'string' ? fromDb.route : fallback.route,
      enabled: typeof fromDb?.enabled === 'boolean' ? fromDb.enabled : fallback.enabled,
      audience: Array.isArray(fromDb?.audience) ? fromDb.audience : fallback.audience,
      supportsAutoRules: typeof fromDb?.supportsAutoRules === 'boolean' ? fromDb.supportsAutoRules : fallback.supportsAutoRules,
      order: typeof fromDb?.order === 'number' ? fromDb.order : fallback.order,
    };
  }).sort((left, right) => left.order - right.order);
}
