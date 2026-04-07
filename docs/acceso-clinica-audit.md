# Auditoria de Accesos Clinicos - NeuroQuest

## Objetivo
Documentar el mecanismo que garantiza acceso completo a todos los modulos clinicos cuando se autentican cuentas especificas, junto con instrucciones de operacion y validacion.

## Hallazgos principales
1. **Override por correo** (`src/modules/access/access.service.ts`): cualquier usuario cuyo correo coincida con la lista `SPECIAL_MODULE_ACCESS_EMAILS` obtiene `manualAllow` con todos los modulos del catalogo, `manualDeny` vacio y sus modulos "pinneados" listados para que la vista lo muestre. Esta logica se ejecuta antes de la resolucion final y no altera ninguno de los datos de Firestore existentes.
2. **Lista configurable**: el valor por defecto incluye `tortasmariasnecocli@gmail.com`, pero puedes extenderla agregando otros emails (por ejemplo, `juan.villa@paisdelconocimiento.org`, `yessyalh@gmail.com`, `portalnecocli@gmail.com`, `marcela368@gmail.com`) en la variable de entorno `SPECIAL_MODULE_ACCESS_EMAILS`.
3. **Integracion con RBAC**: aunque el override ignora el rol del usuario, respeta el catalogo habilitado y se pasa como override adicional al resolver permisos (`mergeUserModuleOverrides`), de modo que no elimina configuraciones previas ni rompe auditorias existentes.

## Correos con acceso especial
- tortasmariasnecocli@gmail.com (habilitado por defecto)
- juan.villa@paisdelconocimiento.org (anadir a env)
- yessyalh@gmail.com (anadir a env)
- portalnecocli@gmail.com (anadir a env)
- marcela368@gmail.com (anadir a env)

## Como extender el acceso
1. Define la variable `SPECIAL_MODULE_ACCESS_EMAILS` en el entorno de despliegue (Vercel/entorno local) con los emails adicionales separados por comas.
2. Cada vez que la funcion se ejecuta, normaliza los emails a minusculas y permite manualmente todos los modulos del catalogo actual.
3. No es necesario editar Firestore ni crear overrides manuales; el override predeterminado es suficiente para cualquiera de los emails configurados.

## Pruebas y validaciones
- `npm run test` (Vitest 29 archivos, 67 pruebas) – sin fallos tras incluir la nueva logica.

## Uso operativo
1. Despues de autenticar con cualquiera de esos correos, consulta `/api/access/me` para verificar que `routeAccess` contiene todas las rutas definidas en `module-catalog.ts`.
2. Para auditoria visual, revisa la coleccion `resolvedAccess` en Firestore; el override aparece con `updatedBy: "special-module-access"` y timestamps recientes.
3. Si necesitas revocar temporalmente, elimina el email de `SPECIAL_MODULE_ACCESS_EMAILS` y redeploya.
