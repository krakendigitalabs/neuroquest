import type { ModuleCatalogEntry, ModuleKey, ResolveAccessInput, ResolvedAccess } from '@/modules/access/access.types';

function getFallbackPatientModules(allowedModules: ModuleKey[], maxModules: number) {
  const preferred: ModuleKey[] = ['check-in', 'observer', 'progress'];
  return [...new Set([...preferred, ...allowedModules])].slice(0, maxModules);
}

function matchesRule(rule: ResolveAccessInput['rules'][number], latestCheckInLevel?: string) {
  if (!rule.condition.latestCheckInLevel?.length) {
    return true;
  }

  return !!latestCheckInLevel && rule.condition.latestCheckInLevel.includes(latestCheckInLevel as never);
}

function getEnabledCatalog(moduleCatalog: ModuleCatalogEntry[], role: ResolveAccessInput['user']['role']) {
  return moduleCatalog
    .filter((module) => module.enabled && module.audience.includes(role))
    .sort((left, right) => left.order - right.order);
}

function getRouteAccess(enabledCatalog: ModuleCatalogEntry[], visibleModules: ModuleKey[]) {
  return enabledCatalog
    .filter((module) => visibleModules.includes(module.key))
    .map((module) => module.route);
}

function getAllowedModules(input: ResolveAccessInput, enabledCatalog: ModuleCatalogEntry[]) {
  const allowed = new Set<ModuleKey>();

  if (input.rolePolicy.baseModules.includes('*')) {
    enabledCatalog.forEach((module) => allowed.add(module.key));
  } else {
    enabledCatalog
      .filter((module) => input.rolePolicy.baseModules.includes(module.key))
      .forEach((module) => allowed.add(module.key));
  }

  const sortedRules = [...input.rules]
    .filter((rule) => rule.active && rule.targetRoles.includes(input.user.role))
    .sort((left, right) => left.effect.priority - right.effect.priority);

  for (const rule of sortedRules) {
    if (!matchesRule(rule, input.user.latestCheckInLevel)) {
      continue;
    }

    rule.effect.allowModules.forEach((module) => allowed.add(module));
    rule.effect.denyModules.forEach((module) => allowed.delete(module));
  }

  input.overrides?.manualAllow?.forEach((module) => allowed.add(module));
  input.overrides?.manualDeny?.forEach((module) => allowed.delete(module));

  return allowed;
}

function resolvePatientModules(input: ResolveAccessInput, enabledCatalog: ModuleCatalogEntry[], allowed: Set<ModuleKey>) {
  const maxModules = input.rolePolicy.maxPatientModules ?? 3;
  const pinnedModules = input.overrides?.pinnedPatientModules?.length
    ? input.overrides.pinnedPatientModules
    : input.user.pinnedPatientModules?.length
      ? (input.user.pinnedPatientModules as ModuleKey[])
      : getFallbackPatientModules([...allowed], maxModules);

  return [...new Set(pinnedModules)]
    .filter((module) => enabledCatalog.some((entry) => entry.key === module))
    .slice(0, maxModules);
}

function buildResolvedAccess(
  userId: string,
  role: ResolveAccessInput['user']['role'],
  enabledCatalog: ModuleCatalogEntry[],
  visibleModules: ModuleKey[],
  canCreateModules: boolean
): ResolvedAccess {
  return {
    userId,
    role,
    visibleModules,
    routeAccess: getRouteAccess(enabledCatalog, visibleModules),
    actions: { canCreateModules },
    resolvedAt: new Date().toISOString(),
  };
}

export function resolveAccess(input: ResolveAccessInput): ResolvedAccess {
  if (input.user.role === 'guest') {
    return buildResolvedAccess(
      input.user.id,
      'guest',
      [{ key: 'check-in', name: 'Chequeo Mental', route: '/check-in', enabled: true, audience: ['guest'], supportsAutoRules: false, order: 1 }],
      ['check-in'],
      false
    );
  }

  const enabledCatalog = getEnabledCatalog(input.moduleCatalog, input.user.role);
  const allowed = getAllowedModules(input, enabledCatalog);

  if (input.user.role === 'patient') {
    const visibleModules = resolvePatientModules(input, enabledCatalog, allowed);
    return buildResolvedAccess(input.user.id, input.user.role, enabledCatalog, visibleModules, false);
  }

  const visibleModules = enabledCatalog
    .map((module) => module.key)
    .filter((module) => allowed.has(module));

  return buildResolvedAccess(
    input.user.id,
    input.user.role,
    enabledCatalog,
    visibleModules,
    input.user.role === 'clinic'
  );
}
