/**
 * ADMIN CONFIG
 * Add or remove emails here. Anyone listed can delete ANY photo.
 */
export const ADMIN_EMAILS: string[] = [
  "sardor091019@gmail.com",
];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
