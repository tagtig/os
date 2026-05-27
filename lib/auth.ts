// Web-Crypto basiert — kompatibel mit Edge-Middleware und Node-Route-Handlern.

export const AUTH_COOKIE = 'tagtig-os-auth';
const SEVEN_DAYS = 60 * 60 * 24 * 7;
const DEV_FALLBACK_SECRET = 'tagtig-os-dev-secret-do-not-use-in-prod-please';

export function authEnabled(): boolean {
  return !!process.env.APP_PASSWORD || !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function secret(): string {
  // AUTH_SECRET preferred; APP_PASSWORD as reliable fallback (always set in Vercel)
  return process.env.AUTH_SECRET || process.env.APP_PASSWORD || DEV_FALLBACK_SECRET;
}

export function appPassword(): string {
  return process.env.APP_PASSWORD ?? '';
}

const enc = new TextEncoder();

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return toHex(new Uint8Array(sig));
}

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export type TokenPayload = {
  userId: string;
  role: 'admin' | 'user';
};

/**
 * Token-Format: base64(JSON{userId,role,iat,exp}) + "." + hmac-hex
 * Das JSON wird base64-kodiert um Cookie-Encoding-Probleme zu vermeiden.
 * Legacy-Format (Rückwärtskompatibilität): {issuedAt}.{expiresAt}.{sig}
 */
export async function issueToken(userId: string, role: 'admin' | 'user'): Promise<string> {
  const iat = Date.now();
  const exp = iat + SEVEN_DAYS * 1000;
  const payload = JSON.stringify({ userId, role, iat, exp });
  const sig = await hmac(payload);
  // btoa is available in both Edge and Node runtimes (Node 16+)
  const b64 = btoa(payload);
  return `${b64}.${sig}`;
}

export async function verifyToken(token: string | undefined | null): Promise<TokenPayload | null> {
  if (!token) return null;

  try {
    // Neues Format: base64(json).hmac-hex
    const dotIdx = token.indexOf('.');
    if (dotIdx > 0) {
      const b64 = token.slice(0, dotIdx);
      const sig = token.slice(dotIdx + 1);

      // Only try this branch if sig looks like a hex string (64 chars, legacy has shorter or different format)
      if (sig.length === 64 && /^[0-9a-f]+$/.test(sig)) {
        try {
          const payload = atob(b64);
          const expected = await hmac(payload);
          if (!constantTimeEqualHex(sig, expected)) return null;
          const data = JSON.parse(payload) as { userId?: string; role?: string; exp?: number };
          if (!data.userId || !data.role) return null;
          if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
          if (data.role !== 'admin' && data.role !== 'user') return null;
          return { userId: data.userId, role: data.role as 'admin' | 'user' };
        } catch {
          // base64 decode or JSON parse failed — fall through to legacy
        }
      }
    }

    // Legacy-Format: {issuedAt}.{expiresAt}.{sig}
    const parts = token.split('.');
    if (parts.length === 3) {
      const [issuedAt, expiresAt, sig] = parts;
      const expected = await hmac(`${issuedAt}.${expiresAt}`);
      if (!constantTimeEqualHex(sig, expected)) return null;
      const exp = Number(expiresAt);
      if (!Number.isFinite(exp) || exp < Date.now()) return null;
      return { userId: 'legacy-admin', role: 'admin' };
    }

    // Old colon-format (before base64 change) — try to parse for backwards compat
    const colonParts = token.split(':');
    if (colonParts.length === 5) {
      const [userId, role, issuedAt, expiresAt, sig] = colonParts;
      const payload = `${userId}:${role}:${issuedAt}:${expiresAt}`;
      const expected = await hmac(payload);
      if (!constantTimeEqualHex(sig, expected)) return null;
      const exp = Number(expiresAt);
      if (!Number.isFinite(exp) || exp < Date.now()) return null;
      if (role !== 'admin' && role !== 'user') return null;
      return { userId, role: role as 'admin' | 'user' };
    }
  } catch {
    return null;
  }

  return null;
}

export const COOKIE_MAX_AGE = SEVEN_DAYS;
