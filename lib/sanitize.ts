/**
 * Safe string sanitization utilities for user-supplied plain text inputs.
 * Strips dangerous HTML control characters and normalizes plain text.
 */
export function sanitizePlainText(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string" && typeof input !== "number") {
    return "";
  }
  const str = String(input);
  // Remove non-printable control characters (except common whitespace)
  const cleaned = str
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    // Strip HTML tag brackets to prevent markup injection
    .replace(/[<>]/g, "")
    .trim();

  return cleaned.slice(0, maxLength);
}

export function sanitizeTitle(title: unknown): string {
  const sanitized = sanitizePlainText(title, 120);
  return sanitized || "Untitled frame";
}

export function sanitizeLocation(location: unknown): string | null {
  if (!location) return null;
  const sanitized = sanitizePlainText(location, 150);
  return sanitized || null;
}

export function sanitizeComment(body: unknown): string {
  return sanitizePlainText(body, 1200);
}
