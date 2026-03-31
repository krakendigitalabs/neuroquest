import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const SUPERADMIN_COOKIE_NAME = 'nq-superadmin-unlocked';

const SUPERADMIN_UNLOCK_SECRET_KEY = 'SUPERADMIN_UNLOCK_SECRET';

export const SUPERADMIN_UNLOCK_TTL_SECONDS = Number(
  process.env.SUPERADMIN_UNLOCK_TTL_SECONDS ?? 5 * 60
);

function getSuperadminUnlockSecret() {
  const secret = process.env[SUPERADMIN_UNLOCK_SECRET_KEY];

  if (!secret) {
    throw new Error('superadmin-unlock-secret-missing');
  }

  return secret;
}

const DEFAULT_SUPERADMIN_EMAILS = ['krakendigitalabs@gmail.com'];

export function getAllowedSuperadminEmails() {
  const raw = process.env.NEXT_PUBLIC_SUPERADMIN_ALLOWED_EMAILS ?? DEFAULT_SUPERADMIN_EMAILS.join(',');

  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedSuperadminEmail(email: string | null | undefined) {
  if (!email) return false;

  return getAllowedSuperadminEmails().includes(email.trim().toLowerCase());
}

function buildUnlockSignature(payload: string) {
  return createHmac('sha256', getSuperadminUnlockSecret()).update(payload).digest('hex');
}

export function createSuperadminUnlockToken() {
  const expires = Math.floor(Date.now() / 1000) + SUPERADMIN_UNLOCK_TTL_SECONDS;
  const nonce = randomBytes(6).toString('hex');
  const payload = `${expires}:${nonce}`;
  const signature = buildUnlockSignature(payload);

  return `${payload}.${signature}`;
}

export function isValidSuperadminUnlockToken(token: string | undefined | null) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return false;
  }

  let expectedSignature: string;

  try {
    expectedSignature = buildUnlockSignature(payload);
  } catch {
    return false;
  }

  let providedBuffer: Buffer;
  let expectedBuffer: Buffer;

  try {
    providedBuffer = Buffer.from(signature, 'hex');
    expectedBuffer = Buffer.from(expectedSignature, 'hex');
  } catch {
    return false;
  }

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return false;
  }

  const [expiresPart] = payload.split(':');
  const expires = Number(expiresPart);

  if (!Number.isFinite(expires)) {
    return false;
  }

  return Math.floor(Date.now() / 1000) < expires;
}
