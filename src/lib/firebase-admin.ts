import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const ADMIN_PROJECT_ID = 'FIREBASE_ADMIN_PROJECT_ID';
const ADMIN_CLIENT_EMAIL = 'FIREBASE_ADMIN_CLIENT_EMAIL';
const ADMIN_PRIVATE_KEY = 'FIREBASE_ADMIN_PRIVATE_KEY';
const PUBLIC_PROJECT_ID = 'NEXT_PUBLIC_FIREBASE_PROJECT_ID';

function stripEnclosingQuotes(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizeEnvVar(name: string): string | undefined {
  const raw = process.env[name];

  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();

  if (!trimmed) {
    return undefined;
  }

  return stripEnclosingQuotes(trimmed);
}

function normalizePrivateKey(raw: string): string {
  const sanitized = raw.replace(/\\n/g, '\n');

  if (!sanitized.includes('PRIVATE KEY')) {
    console.warn(
      '[firebase-admin] FIREBASE_ADMIN_PRIVATE_KEY appears malformed; ensure it contains BEGIN/END markers and uses \\n escapes.'
    );
    throw new Error('firebase-admin-config-missing');
  }

  return sanitized;
}

function requireAdminConfig() {
  const projectId = normalizeEnvVar(ADMIN_PROJECT_ID);
  const clientEmail = normalizeEnvVar(ADMIN_CLIENT_EMAIL);
  const privateKeyRaw = normalizeEnvVar(ADMIN_PRIVATE_KEY);
  const publicProjectId = normalizeEnvVar(PUBLIC_PROJECT_ID);

  if (!projectId || !clientEmail || !privateKeyRaw) {
    console.warn('[firebase-admin] admin credentials are incomplete (projectId/clientEmail/privateKey missing).');
    throw new Error('firebase-admin-config-missing');
  }

  if (publicProjectId && publicProjectId !== projectId) {
    console.warn(
      `[firebase-admin] NEXT_PUBLIC_FIREBASE_PROJECT_ID (${publicProjectId}) does not match ${ADMIN_PROJECT_ID} (${projectId}).`
    );
    throw new Error('firebase-admin-project-mismatch');
  }

  const privateKey = normalizePrivateKey(privateKeyRaw);

  return { projectId, clientEmail, privateKey };
}

function initializeAdminApp() {
  if (getApps().length) {
    return getApp();
  }

  const { projectId, clientEmail, privateKey } = requireAdminConfig();

  console.info(`[firebase-admin] initializing with projectId=${projectId}`);

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

let cachedApp = getApps().length ? getApp() : undefined;

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
