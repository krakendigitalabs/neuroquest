export const SUPERADMIN_COOKIE_NAME = 'nq-superadmin-unlocked';
export const SUPERADMIN_SESSION_COOKIE_NAME = 'nq-superadmin-session';
export const PRIMARY_SUPERADMIN_EMAIL = 'krakendigitalabs@gmail.com';

const DEFAULT_SUPERADMIN_EMAILS = [PRIMARY_SUPERADMIN_EMAIL];

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

export function isPrimarySuperadminEmail(email: string | null | undefined) {
  if (!email) return false;

  return email.trim().toLowerCase() === PRIMARY_SUPERADMIN_EMAIL;
}
