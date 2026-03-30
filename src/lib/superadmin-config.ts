export const SUPERADMIN_COOKIE_NAME = 'nq-superadmin-unlocked';

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
