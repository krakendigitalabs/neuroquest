# Arquitectura Propuesta: Superadmin, Workspace y RBAC

## Objetivo

Definir una arquitectura mantenible para NeuroQuest que separe:

- autenticación
- autorización
- consola de superadministración
- gestión de usuarios y accesos
- configuración del workspace

La meta es que `userRole` y `accountRole` no se mezclen, que el acceso quede protegido en cliente y servidor, y que el panel administrativo escale sin romper los módulos clínicos.

## Capas

### 1. App Router

Responsable de:

- layouts
- páginas
- route groups
- middleware
- rutas públicas y protegidas

### 2. Modules

Responsable de:

- lógica de negocio por dominio
- servicios de permisos
- servicios de superadmin
- user management
- workspace settings

### 3. Shared

Responsable de:

- componentes UI reutilizables
- hooks genéricos
- helpers
- tipos compartidos

### 4. Infra

Responsable de:

- Firebase Auth
- Firestore
- adapters
- server-side guards
- reglas de persistencia

## Estructura de carpetas

```txt
src/
  app/
    layout.tsx
    page.tsx
    loading.tsx

    (public)/
      layout.tsx
      page.tsx
      home/page.tsx
      login/page.tsx

    (app)/
      layout.tsx
      dashboard/page.tsx
      check-in/page.tsx
      observer/page.tsx
      exposure/page.tsx
      regulation/page.tsx
      reprogram/page.tsx
      progress/page.tsx
      grounding/page.tsx
      wellness/page.tsx
      medical-support/page.tsx
      medication/page.tsx

    (workspace)/
      layout.tsx
      workspace-users/page.tsx
      workspace-settings/page.tsx
      workspace-audit/page.tsx

    (therapist)/
      layout.tsx
      therapist/page.tsx
      therapist/patient/[id]/page.tsx

    (superadmin)/
      layout.tsx
      superadmin/page.tsx
      superadmin/login/page.tsx

    api/
      auth/session/route.ts
      superadmin/unlock/route.ts
      workspace/settings/route.ts
      workspace/users/route.ts

  modules/
    auth/
      guards.ts
      permissions.ts
      session.ts
      types.ts
    workspace/
      settings.ts
      settings-schema.ts
      user-management.ts
      audit.ts
    superadmin/
      superadmin-config.ts
      superadmin-service.ts
    users/
      user-profile.ts
      user-repository.ts

  components/
    ui/
    protected-route.tsx
    role-badge.tsx
    workspace/
      settings-form.tsx
      user-table.tsx
      user-create-form.tsx

  hooks/
    use-user-profile.ts
    use-account-access.ts
    use-therapist-access.ts
    use-workspace-settings.ts

  firebase/
    client.ts
    admin.ts
    non-blocking-updates.tsx

  lib/
    account-role.ts
    utils.ts

  models/
    user.ts
    workspace-settings.ts
```

## Layouts

### `src/app/layout.tsx`

Layout raíz:

- providers globales
- idioma
- tema global
- shell común

### `src/app/(public)/layout.tsx`

Para:

- landing
- login
- páginas públicas

### `src/app/(app)/layout.tsx`

Para usuario autenticado estándar:

- sidebar principal
- dashboard
- módulos clínicos y de seguimiento

### `src/app/(workspace)/layout.tsx`

Para consola administrativa:

- navegación administrativa
- guard de permisos operativos
- métricas de workspace

### `src/app/(therapist)/layout.tsx`

Para profesionales:

- lista de pacientes
- detalle clínico
- vistas con acceso restringido

### `src/app/(superadmin)/layout.tsx`

Para:

- gate del PIN
- login con Google
- redirección segura al panel de administración

## Nombres de páginas

### Públicas

- `/`
- `/home`
- `/login`

### Aplicación

- `/dashboard`
- `/check-in`
- `/observer`
- `/exposure`
- `/regulation`
- `/reprogram`
- `/progress`
- `/grounding`
- `/wellness`
- `/medical-support`
- `/medication`

### Administrativas

- `/workspace-users`
- `/workspace-settings`
- `/workspace-audit`

### Superadmin

- `/superadmin`
- `/superadmin/login`

### Profesionales

- `/therapist`
- `/therapist/patient/[id]`

## Guardas de rutas

Se recomienda separar tres guardas:

### `requireAuth`

Verifica si existe sesión.

### `requireAccountRole`

Verifica permisos operativos:

- `viewer`
- `commentator`
- `editor`
- `administrator`
- `manager`
- `owner`

### `requireUserRole`

Verifica tipo de usuario:

- `patient`
- `professional`
- `clinic`

## Middleware de autenticación y autorización

### Objetivo

Proteger desde el borde:

- rutas autenticadas
- rutas de superadmin
- consola administrativa

### Base recomendada

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const AUTH_REQUIRED = [
  '/dashboard',
  '/workspace-users',
  '/workspace-settings',
  '/workspace-audit',
  '/therapist',
  '/medication',
];

const SUPERADMIN_REQUIRED = [
  '/superadmin/login',
  '/workspace-users',
  '/workspace-settings',
  '/workspace-audit',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = req.cookies.get('nq-session')?.value;
  const superadminUnlocked = req.cookies.get('nq-superadmin-unlocked')?.value === '1';

  if (AUTH_REQUIRED.some((path) => pathname.startsWith(path)) && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (SUPERADMIN_REQUIRED.some((path) => pathname.startsWith(path)) && !superadminUnlocked) {
    const url = req.nextUrl.clone();
    url.pathname = '/superadmin';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workspace-users/:path*',
    '/workspace-settings/:path*',
    '/workspace-audit/:path*',
    '/therapist/:path*',
    '/medication/:path*',
    '/superadmin/login/:path*',
  ],
};
```

## Ejemplo de RBAC

### Separación correcta

`userRole` responde:

- qué tipo de usuario es

`accountRole` responde:

- qué puede hacer dentro del workspace

### Tipos recomendados

```ts
// src/lib/account-role.ts
export type AccountRole =
  | 'viewer'
  | 'commentator'
  | 'editor'
  | 'administrator'
  | 'manager'
  | 'owner';

const ORDER: AccountRole[] = [
  'viewer',
  'commentator',
  'editor',
  'administrator',
  'manager',
  'owner',
];

export function hasMinimumAccountRole(
  current: AccountRole | null | undefined,
  required: AccountRole
) {
  if (!current) return false;
  return ORDER.indexOf(current) >= ORDER.indexOf(required);
}

export function canManageWorkspaceUsers(role: AccountRole | null | undefined) {
  return hasMinimumAccountRole(role, 'administrator');
}

export function canEditWorkspace(role: AccountRole | null | undefined) {
  return hasMinimumAccountRole(role, 'editor');
}

export function canViewAudit(role: AccountRole | null | undefined) {
  return hasMinimumAccountRole(role, 'manager');
}
```

### User roles

```ts
// src/models/user.ts
export type UserRole = 'patient' | 'professional' | 'clinic';
```

## Pseudocódigo del flujo superadmin

```txt
GET /superadmin
  mostrar keypad numérico

usuario ingresa PIN

POST /api/superadmin/unlock
  leer SUPERADMIN_PIN desde entorno
  trim()
  comparar contra pin recibido
  si coincide:
    set cookie httpOnly nq-superadmin-unlocked=1
    devolver ok
  si no coincide:
    devolver 401

GET /superadmin/login
  middleware exige cookie nq-superadmin-unlocked
  mostrar login Google

Google login
  obtener email
  validar contra lista exacta permitida
  si no está permitido:
    cerrar sesión
    mostrar error
  si está permitido:
    buscar users/{uid}
    si no existe:
      crear perfil con:
        userRole = clinic
        accountRole = owner
        isAdmin = true
    si existe:
      asegurar owner + clinic + isAdmin
    redirigir a /workspace-users
```

## Código base del login superadmin

```ts
async function ensureSuperadminProfile(user: AuthUser) {
  const userRef = doc(firestore, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  const baseProfile = {
    id: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? 'Superadministrador',
    photoURL: user.photoURL ?? '',
    userRole: 'clinic',
    accountRole: 'owner',
    requestedRole: 'clinic',
    isAdmin: true,
    isAnonymous: false,
    level: snapshot.data()?.level ?? 1,
    currentXp: snapshot.data()?.currentXp ?? 0,
    xpToNextLevel: snapshot.data()?.xpToNextLevel ?? 100,
    therapistIds: snapshot.data()?.therapistIds ?? [],
  };

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      ...baseProfile,
      createdAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(userRef, baseProfile, { merge: true });
}
```

## Código base de guards

```ts
// src/modules/auth/guards.ts
import { hasMinimumAccountRole } from '@/lib/account-role';
import type { AccountRole } from '@/lib/account-role';
import type { UserRole } from '@/models/user';

export function requireAuth(user: { uid?: string } | null) {
  return !!user?.uid;
}

export function requireAccountRole(
  accountRole: AccountRole | null | undefined,
  minimumRole: AccountRole
) {
  return hasMinimumAccountRole(accountRole, minimumRole);
}

export function requireUserRole(
  userRole: UserRole | null | undefined,
  allowedRoles: UserRole[]
) {
  return !!userRole && allowedRoles.includes(userRole);
}
```

## Código base para páginas protegidas

```ts
const { userProfile } = useUserProfile();
const canOpenPage = canManageWorkspaceUsers(userProfile?.accountRole);

useEffect(() => {
  if (!canOpenPage) {
    router.push('/dashboard');
  }
}, [canOpenPage, router]);
```

## Configuración del workspace

### Documento recomendado

Ruta:

```txt
workspaceSettings/default
```

### Shape recomendado

```ts
export type WorkspaceSettings = {
  themePreset: 'dark-blue' | 'clinical-white' | 'soft-gold' | 'graphite' | 'ivory';
  workspaceLanguage: 'es' | 'en' | 'bilingual' | 'es-co' | 'es-mx';
  defaultUserRole: 'patient' | 'professional' | 'clinic';
  defaultAccountRole: 'viewer' | 'commentator' | 'editor' | 'administrator' | 'manager';
  crisisRouting: 'strict' | 'guided' | 'professional-first' | 'clinic-review' | 'emergency-direct';
  dashboardDensity: 'compact' | 'comfortable' | 'focused' | 'clinical' | 'expanded';
  followUpMode: 'daily' | 'business-days' | 'weekly' | 'manual' | 'critical-only';
  updatedAt?: unknown;
  updatedBy?: string;
};
```

## Firestore rules mínimas

```txt
/workspaceSettings/{settingId}
  read: administrator+
  write: administrator+
  delete: owner o admin global

/users/{userId}
  self read/write limitado
  userRole/accountRole/isAdmin solo pueden ser mutados por administrator+

/roles_admin/{uid}
  solo lectura controlada
  create/update/delete fuera del cliente
```

## Flujo de creación de usuarios

```txt
owner/manager/administrator entra a /workspace-users
  cargar users/*
  cargar workspaceSettings/default

admin crea o actualiza usuario
  define:
    displayName
    email
    userRole
    accountRole

cliente valida opciones visibles según jerarquía
servidor vuelve a validar

si requester puede asignar ese role:
  guardar documento
si no:
  bloquear por rules
```

## Orden recomendado de implementación

1. `middleware`
2. `guards.ts`
3. `account-role.ts`
4. `superadmin` flow
5. `workspaceSettings/default`
6. `workspace-users`
7. `workspace-audit`
8. tests de permisos y redirección

## Resultado esperado

Con esta arquitectura:

- el acceso queda protegido desde middleware y cliente
- el superadmin no depende de rutas indirectas
- `owner`, `manager` y `administrator` quedan bien separados
- el workspace puede configurarse desde una sola consola
- RBAC se mantiene consistente entre UI, hooks, middleware y Firestore rules
