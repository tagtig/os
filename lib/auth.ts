// Web-Crypto basiert, damit es sowohl in Edge-Middleware als auch in Node-Route-Handlern läuft.

export const AUTH_COOKIE = 'tagtig-os-auth';
const SEVEN_DAYS = 60 * 60 * 24 * 7;
const DEV_FALLBACK_SECRET = 'tagtig-os-dev-secret-do-not-use-in-prod-please';

export function authEnabled(): boolean {
  return !!process.env.APP_PASSWORD;
}

function secret(): string {
  return process.env.AUTH_SECRET || DEV_FALLBACK_SECRET;
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

export async function issueToken(): Promise<string> {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SEVEN_DAYS * 1000;
  const payload = `${issuedAt}.${expiresAt}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifyToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [issuedAt, expiresAt, sig] = parts;
  const expected = await hmac(`${issuedAt}.${expiresAt}`);
  if (!constantTimeEqualHex(sig, expected)) return false;
  const exp = Number(expiresAt);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return true;
}

export const COOKIE_MAX_AGE = SEVEN_DAYS;
