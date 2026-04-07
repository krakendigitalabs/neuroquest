import 'server-only';

import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const ADMIN_PROJECT_ID = 'FIREBASE_ADMIN_PROJECT_ID';
const ADMIN_CLIENT_EMAIL = 'FIREBASE_ADMIN_CLIENT_EMAIL';
const ADMIN_PRIVATE_KEY = 'FIREBASE_ADMIN_PRIVATE_KEY';
const PUBLIC_PROJECT_ID = 'NEXT_PUBLIC_FIREBASE_PROJECT_ID';

let cachedApp: App | undefined;

function stripEnclosingQuotes(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  return value;
}

function sanitizeEnvValue(raw?: string): string | undefined {
  if (!raw) return undefined;

  const stripped = stripEnclosingQuotes(raw).trim();
  return stripped || undefined;
}

function normalizePrivateKey(raw?: string): string | undefined {
  const sanitized = sanitizeEnvValue(raw);

  if (!sanitized) return undefined;

  return sanitized.replace(/\\n/g, '\n');
}

function requireAdminConfig() {
  const projectId = sanitizeEnvValue(process.env[ADMIN_PROJECT_ID]);
  const clientEmail = sanitizeEnvValue(process.env[ADMIN_CLIENT_EMAIL]);
  const privateKey = normalizePrivateKey(process.env[ADMIN_PRIVATE_KEY]);
  const publicProjectId = sanitizeEnvValue(process.env[PUBLIC_PROJECT_ID]);
  const privateKeyLooksNormalized = Boolean(privateKey && privateKey.includes('PRIVATE KEY'));

  console.info(
    `[firebase-admin] env projectId=${Boolean(projectId)} clientEmail=${Boolean(clientEmail)} privateKeyPresent=${Boolean(privateKey)} privateKeyHasMarker=${privateKeyLooksNormalized}`
  );

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      '[firebase-admin] admin credentials are incomplete; ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY are set'
    );
    throw new Error('firebase-admin-config-missing');
  }

  if (publicProjectId && publicProjectId !== projectId) {
    console.error(
      `[firebase-admin] NEXT_PUBLIC_FIREBASE_PROJECT_ID (${publicProjectId}) does not match ${ADMIN_PROJECT_ID} (${projectId})`
    );
    throw new Error('firebase-admin-project-mismatch');
  }

  return { projectId, clientEmail, privateKey };
}

function initializeAdminApp() {
  if (getApps().length) {
    return getApp();
  }

  const { projectId, clientEmail, privateKey } = requireAdminConfig();

  console.info(`[firebase-admin] initializing admin app for projectId=${projectId}`);

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

function getAdminApp() {
  if (cachedApp) {
    return cachedApp;
  }

  cachedApp = initializeAdminApp();
  return cachedApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
