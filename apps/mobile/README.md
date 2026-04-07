# NeuroQuest Mobile (Expo)

## 1) Setup
1. Copia `.env.example` a `.env`.
2. Completa Firebase y `EXPO_PUBLIC_API_BASE_URL`.
3. Instala dependencias:
```bash
npm install
npm --prefix apps/mobile install
```

## 2) Ejecutar
```bash
npm run mobile:start
npm run mobile:android
npm run mobile:ios
npm run mobile:web
```

## 3) Flujo de auth/backend
- Login Firebase (email + Google).
- Obtiene ID token Firebase.
- Crea sesión backend: `POST /api/auth/session`.
- Lee acceso por rol/módulos: `GET /api/access/me`.
- Envía token en headers `Authorization` y `x-nq-id-token`.

## 4) Escalabilidad preparada
- `src/services/notifications.ts` (push, TODO).
- `src/services/offline-sync.ts` (offline queue, TODO).
