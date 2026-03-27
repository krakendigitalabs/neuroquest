# Local Seed

Usa este script para poblar Firestore/Auth con datos de prueba reales para `check-in`, `progress` y `therapist`.

## Requisitos

- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` en `.env`
- una credencial de servicio de Firebase:
  - `GOOGLE_APPLICATION_CREDENTIALS=C:\ruta\service-account.json`
  - o `FIREBASE_SERVICE_ACCOUNT_JSON` con el JSON completo

## Ejecutar

```bash
npm run seed:firestore
```

Opciones:

```bash
npm run seed:firestore -- --prefix demo
npm run seed:firestore -- --password MiClaveSegura123!
```

## Qué crea

- 1 terapeuta con acceso admin:
  - email: `<prefix>.therapist@example.com`
- 2 pacientes:
  - `<prefix>.patient.a@example.com`
  - `<prefix>.patient.b@example.com`
- documentos en:
  - `/therapists/{uid}`
  - `/roles_admin/{uid}`
  - `/users/{uid}`
  - `/users/{uid}/mental_checkups`
  - `/users/{uid}/thoughtRecords`
  - `/users/{uid}/exposureMissions`

## Qué probar en localhost

1. Corre el seed.
2. Levanta la app con `npm run dev`.
3. Entra con el terapeuta seed.
4. Abre `/therapist` y verifica:
   - lista real de pacientes
   - último check-in
   - riesgo básico desde `latestCheckInLevel`
   - detalle con pensamientos y misiones
5. Entra con uno de los pacientes seed.
6. Abre `/progress` y verifica:
   - métricas reales
   - tendencia de check-ins
   - misiones y pensamientos reales

## Nota

El script es idempotente por prefijo: reusar el mismo `--prefix` vuelve a escribir los mismos documentos de prueba en vez de crear duplicados nuevos.
