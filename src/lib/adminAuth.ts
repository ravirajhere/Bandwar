/**
 * Zero-Database Admin Auth using HMAC-signed session tokens.
 * Works in both Node.js (API) and Edge (Middleware) runtimes.
 */

// Constant-time string comparison (prevents timing attacks)
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Derive a stable session token from the secret
export async function getExpectedSessionToken(): Promise<string> {
  // 🚀 HARDCODED FALLBACK: If env var is missing, use this default secret
  const secret = process.env.ADMIN_SESSION_SECRET || "bandwar-super-secret-default-hmac-key-99";
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("bandwar-admin-session-v1")
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Validate a session cookie value against the expected token
export async function isValidSession(
  cookieValue: string | undefined
): Promise<boolean> {
  if (!cookieValue) return false;
  try {
    const expected = await getExpectedSessionToken();
    return timingSafeEqual(cookieValue, expected);
  } catch {
    return false;
  }
}

// Validate admin password securely
export function isValidPassword(password: string): boolean {
  // 🚀 HARDCODED FALLBACK: If env var is missing, use "Bandwar@2026"
  const expected = process.env.ADMIN_PASSWORD || "Bandwar@2026";
  
  return timingSafeEqual(password, expected);
}