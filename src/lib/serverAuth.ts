import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'rasel_session';
// No hardcoded fallbacks: set both in the hosting environment (see .env.local.example).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.ADMIN_PASSWORD) console.warn('ADMIN_PASSWORD is not set: admin password login is disabled.');
if (!process.env.SESSION_SECRET) console.warn('SESSION_SECRET is not set: using a random one, sessions reset on restart.');

// Rate limiting in-memory bucket: IP -> { attempts: number, resetAt: number }
const rateLimitMap = new Map<string, { attempts: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - 1 };
  }

  if (entry.attempts >= MAX_LOGIN_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.attempts += 1;
  return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - entry.attempts };
}

export function resetRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

/**
 * Sign payload: payload.signature
 */
export function createSignedToken(data: { role: string; expiresAt: number; user?: any }): string {
  const payloadStr = Buffer.from(JSON.stringify(data)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadStr);
  const signature = hmac.digest('base64url');
  return `${payloadStr}.${signature}`;
}

/**
 * Verify signed token
 */
export function verifyToken(token: string): { valid: boolean; role?: string; user?: any } {
  if (!token || !token.includes('.')) return { valid: false };

  const [payloadStr, signature] = token.split('.');
  if (!payloadStr || !signature) return { valid: false };

  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadStr);
  const expectedSig = hmac.digest('base64url');

  if (signature.length !== expectedSig.length) return { valid: false };
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return { valid: false };
  }

  try {
    const jsonStr = Buffer.from(payloadStr, 'base64url').toString('utf8');
    const data = JSON.parse(jsonStr);

    if (typeof data.expiresAt === 'number' && data.expiresAt > Date.now()) {
      return { valid: true, role: data.role || 'admin', user: data.user };
    }
  } catch {
    return { valid: false };
  }

  return { valid: false };
}

/**
 * Constant-time password validation
 */
export function verifyAdminPassword(input: string, customPinHash?: string | null): boolean {
  if (!input) return false;
  const trimmed = input.trim();

  // 1. Check default admin password 
  for (const candidate of ADMIN_PASSWORD ? [ADMIN_PASSWORD] : []) {
    if (trimmed.length === candidate.length) {
      const match = crypto.timingSafeEqual(
        Buffer.from(trimmed, 'utf8'),
        Buffer.from(candidate, 'utf8')
      );
      if (match) return true;
    }
  }

  // 2. Custom pin check if hash provided
  if (customPinHash) {
    const encoder = new TextEncoder();
    const data = encoder.encode(trimmed + '_rasel_salt_2026');
    const inputHash = crypto.createHash('sha256').update(data).digest('hex');
    if (inputHash.length === customPinHash.length) {
      if (crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(customPinHash))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Verify request authentication from session cookie or Authorization header
 */
export function verifySessionRequest(req: NextRequest): { authenticated: boolean; role?: string; user?: any } {
  // Check cookie
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) {
    const result = verifyToken(cookie.value);
    if (result.valid) return { authenticated: true, role: result.role, user: result.user };
  }

  // Check Bearer header fallback
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const result = verifyToken(token);
    if (result.valid) return { authenticated: true, role: result.role, user: result.user };
  }

  return { authenticated: false };
}

export { SESSION_COOKIE_NAME };
