import { describe, expect, it } from 'vitest';
import { resolveAccess } from '@/modules/access/access.resolver';
import type { ResolveAccessInput } from '@/modules/access/access.types';

function buildInput(overrides: Partial<ResolveAccessInput>): ResolveAccessInput {
  return {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      displayName: 'User',
      photoURL: '',
      role: 'professional',
      userRole: 'professional',
      accountRole: 'viewer',
      level: 1,
      currentXp: 0,
      xpToNextLevel: 100,
      isAdmin: false,
      isAnonymous: false,
      createdAt: '' as never,
      therapistIds: [],
      pinnedPatientModules: [],
      moduleVisibilityLimit: 'all',
    },
    rolePolicy: {
      role: 'professional',
      baseModules: ['*'],
      canCreateModules: false,
    },
    moduleCatalog: [
      { key: 'check-in', name: 'Check-In', route: '/check-in', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 1 },
      { key: 'observer', name: 'Observer', route: '/observer', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 2 },
      { key: 'progress', name: 'Progress', route: '/progress', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 3 },
      { key: 'medical-support', name: 'Medical', route: '/medical-support', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 4 },
    ],
    rules: [],
    overrides: null,
    ...overrides,
  };
}

describe('resolveAccess module visibility limit', () => {
  it('limits visible modules to 2 when user has moduleVisibilityLimit=2', () => {
    const resolved = resolveAccess(
      buildInput({
        user: {
          ...buildInput({}).user,
          moduleVisibilityLimit: 2,
        },
      }),
    );

    expect(resolved.visibleModules).toEqual(['check-in', 'observer']);
    expect(resolved.routeAccess).toEqual(['/check-in', '/observer']);
  });

  it('keeps all visible modules when user has moduleVisibilityLimit=all', () => {
    const resolved = resolveAccess(buildInput({}));

    expect(resolved.visibleModules).toEqual(['check-in', 'observer', 'progress', 'medical-support']);
  });

  it('removes guest check-in when check-in is disabled in module catalog', () => {
    const resolved = resolveAccess(
      buildInput({
        user: {
          ...buildInput({}).user,
          role: 'guest',
        },
        rolePolicy: {
          role: 'guest',
          baseModules: ['check-in'],
          canCreateModules: false,
        },
        moduleCatalog: [
          { key: 'check-in', name: 'Check-In', route: '/check-in', enabled: false, audience: ['guest'], supportsAutoRules: false, order: 1 },
        ],
      }),
    );

    expect(resolved.visibleModules).toEqual([]);
    expect(resolved.routeAccess).toEqual([]);
  });

  it('keeps guest check-in when check-in is enabled in module catalog', () => {
    const resolved = resolveAccess(
      buildInput({
        user: {
          ...buildInput({}).user,
          role: 'guest',
        },
        rolePolicy: {
          role: 'guest',
          baseModules: ['check-in'],
          canCreateModules: false,
        },
        moduleCatalog: [
          { key: 'check-in', name: 'Check-In', route: '/check-in', enabled: true, audience: ['guest'], supportsAutoRules: false, order: 1 },
        ],
      }),
    );

    expect(resolved.visibleModules).toEqual(['check-in']);
    expect(resolved.routeAccess).toEqual(['/check-in']);
  });
});
