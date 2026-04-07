import { describe, expect, it } from 'vitest';
import { mergeModuleCatalogWithFallback } from '@/modules/superadmin/module-catalog-utils';

describe('mergeModuleCatalogWithFallback', () => {
  it('keeps fallback modules when firestore catalog is partial', () => {
    const merged = mergeModuleCatalogWithFallback([
      { key: 'check-in', enabled: false, order: 1 },
      { key: 'observer', enabled: true, order: 2 },
    ]);

    expect(merged.some((entry) => entry.key === 'check-in' && entry.enabled === false)).toBe(true);
    expect(merged.some((entry) => entry.key === 'observer' && entry.enabled === true)).toBe(true);
    expect(merged.some((entry) => entry.key === 'progress')).toBe(true);
    expect(merged.some((entry) => entry.key === 'medical-support')).toBe(true);
  });

  it('ignores unknown module keys from firestore docs', () => {
    const merged = mergeModuleCatalogWithFallback([
      { key: 'unknown-module', enabled: false },
      { key: 'check-in', enabled: true },
    ]);

    expect(merged.find((entry) => entry.key === 'check-in')?.enabled).toBe(true);
    expect(merged.some((entry) => entry.key === ('unknown-module' as never))).toBe(false);
  });
});
