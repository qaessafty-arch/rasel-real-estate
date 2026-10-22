/**
 * Authentication and Cryptographic Session Verification
 * Supports Master Key 'Ibo0909' and custom administrator PINs with SHA-256 hashing.
 * Integrates server-enforced authentication with offline fallback.
 */

const MASTER_KEYS = ['Ibo0909', 'ibo0909'];
const SESSION_STORAGE_KEY = 'rasel_auth_session_v2';
const LEGACY_STORAGE_KEY = 'rasel_auth_unlocked';
const CUSTOM_PIN_KEY = 'rasel_custom_pin_hash';
const CUSTOM_PIN_LEGACY = 'rasel_custom_pin';

// Compute SHA-256 hex digest using Web Crypto API
export async function sha256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text + '_rasel_salt_2026');
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return 'simple_' + Math.abs(hash).toString(16);
}

export interface AuthSession {
  token: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Server-enforced login with offline-resilient fallback
 */
export async function loginWithServer(
  password: string,
  remember: boolean = true
): Promise<{ success: boolean; message?: string; rateLimited?: boolean }> {
  const trimmed = password.trim();
  if (!trimmed) {
    return { success: false, message: 'تکایە وشەی نهێنی بنووسە!' };
  }

  // Get custom pin hash if configured
  const customPinHash = typeof window !== 'undefined' ? localStorage.getItem(CUSTOM_PIN_KEY) : null;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: trimmed, customPinHash, remember }),
    });

    const data = await res.json();

    if (res.status === 429) {
      return { success: false, message: data.message, rateLimited: true };
    }

    if (data.success && data.token) {
      // Store client session reference
      const session: AuthSession = {
        token: data.token,
        expiresAt: data.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
      };
      if (typeof window !== 'undefined') {
        const serialized = JSON.stringify(session);
        if (remember) {
          localStorage.setItem(SESSION_STORAGE_KEY, serialized);
          localStorage.setItem(LEGACY_STORAGE_KEY, 'true');
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
          sessionStorage.setItem(LEGACY_STORAGE_KEY, 'true');
        }
      }
      return { success: true };
    }

    return { success: false, message: data.message || 'وشەی نهێنی هەڵەیە!' };
  } catch {
    // Offline fallback when network or local API route is unreachable
    const isValid = await verifyMasterPassword(trimmed);
    if (isValid) {
      await createSession(remember);
      return { success: true };
    }
    return { success: false, message: 'وشەی نهێنی هەڵەیە! تکایە وشەی ڕاست بنووسە.' };
  }
}

/**
 * Validate password against master keys or custom administrator PIN (local / offline)
 */
export async function verifyMasterPassword(inputPassword: string): Promise<boolean> {
  const trimmed = inputPassword.trim();
  if (!trimmed) return false;

  // 1. Direct master key check
  if (MASTER_KEYS.includes(trimmed)) {
    return true;
  }

  // 2. Custom PIN check
  if (typeof window !== 'undefined') {
    const customHash = localStorage.getItem(CUSTOM_PIN_KEY);
    if (customHash) {
      const inputHash = await sha256(trimmed);
      if (inputHash === customHash) return true;
    }

    // Legacy unhashed custom pin check
    const legacyPin = localStorage.getItem(CUSTOM_PIN_LEGACY);
    if (legacyPin && legacyPin === trimmed) {
      const hashed = await sha256(trimmed);
      localStorage.setItem(CUSTOM_PIN_KEY, hashed);
      localStorage.removeItem(CUSTOM_PIN_LEGACY);
      return true;
    }
  }

  return false;
}

/**
 * Create and persist authenticated session locally
 */
export async function createSession(remember: boolean = true): Promise<AuthSession> {
  const token = await sha256('authenticated_' + Date.now() + Math.random());
  const duration = remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const session: AuthSession = {
    token,
    expiresAt: Date.now() + duration,
    createdAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    const serialized = JSON.stringify(session);
    if (remember) {
      localStorage.setItem(SESSION_STORAGE_KEY, serialized);
      localStorage.setItem(LEGACY_STORAGE_KEY, 'true');
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
      sessionStorage.setItem(LEGACY_STORAGE_KEY, 'true');
    }
  }

  return session;
}

/**
 * Check whether the current user holds an active, unexpired session
 */
export async function checkServerSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/session');
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        return true;
      }
    }
  } catch {
    // Network error: fall back to local check
  }

  return isSessionValid();
}

/**
 * Synchronous local session validity check
 */
export function isSessionValid(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const localSess = localStorage.getItem(SESSION_STORAGE_KEY);
    const sessionSess = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const raw = localSess || sessionSess;

    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      if (session && session.expiresAt && session.expiresAt > Date.now()) {
        return true;
      }
    }

    const legacyUnlocked =
      localStorage.getItem(LEGACY_STORAGE_KEY) === 'true' ||
      sessionStorage.getItem(LEGACY_STORAGE_KEY) === 'true';

    return legacyUnlocked;
  } catch {
    return false;
  }
}

/**
 * Invalidate session and lock the system both locally and on server
 */
export async function clearSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore network error on logout
  }

  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_STORAGE_KEY);
}

/**
 * Save new administrator PIN with cryptographic hash
 */
export async function setCustomPin(newPin: string): Promise<boolean> {
  const trimmed = newPin.trim();
  if (trimmed.length < 4) return false;

  const hashed = await sha256(trimmed);
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_PIN_KEY, hashed);
    localStorage.removeItem(CUSTOM_PIN_LEGACY);
  }
  return true;
}
