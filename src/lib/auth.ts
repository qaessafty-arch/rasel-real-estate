/**
 * Authentication and Multi-Role Employee System
 * Supports Administrator PINs and Employee Accounts.
 * Role-Based: 'admin' (full access) vs 'employee' (portfolio & contracts, no financials/settings/reset).
 */

import { Employee, UserRole, UserSession } from '@/types';

const SESSION_STORAGE_KEY = 'rasel_auth_session_v3';
const LEGACY_STORAGE_KEY = 'rasel_auth_unlocked';
const CUSTOM_PIN_KEY = 'rasel_custom_pin_hash';
const CUSTOM_PIN_LEGACY = 'rasel_custom_pin';
const EMPLOYEES_STORAGE_KEY = 'nashville_employees_v1';

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-admin',
    name: 'بەڕێوەبەری گشتی (Admin)',
    username: 'admin',
    pin: '', // no default password: the admin signs in with the server ADMIN_PASSWORD
    phone: '0750 000 0000',
    role: 'admin',
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

// SHA-256 hash
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
  user: UserSession;
}

// -------------------------------------------------------------
// EMPLOYEE ACCOUNTS REPOSITORY
// -------------------------------------------------------------

export function getEmployees(): Employee[] {
  if (typeof window === 'undefined') return DEFAULT_EMPLOYEES;
  try {
    const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_EMPLOYEES;
  } catch {
    return DEFAULT_EMPLOYEES;
  }
}

export function saveEmployee(emp: Employee): Employee {
  const list = getEmployees();
  const idx = list.findIndex((e) => e.id === emp.id);
  if (idx >= 0) {
    list[idx] = emp;
  } else {
    list.push(emp);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(list));
  }
  return emp;
}

export function deleteEmployee(id: string): boolean {
  if (id === 'emp-admin') return false; // Prevent removing master admin
  const list = getEmployees().filter((e) => e.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(list));
  }
  return true;
}

export function toggleEmployeeStatus(id: string): Employee | null {
  if (id === 'emp-admin') return null;
  const list = getEmployees();
  const emp = list.find((e) => e.id === id);
  if (emp) {
    emp.status = emp.status === 'active' ? 'inactive' : 'active';
    if (typeof window !== 'undefined') {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(list));
    }
    return emp;
  }
  return null;
}

// -------------------------------------------------------------
// AUTHENTICATION & LOGIN
// -------------------------------------------------------------

/**
 * Server-enforced login with offline-resilient multi-account fallback
 */
export async function loginWithServer(
  password: string,
  remember: boolean = true,
  username?: string
): Promise<{ success: boolean; message?: string; rateLimited?: boolean; user?: UserSession }> {
  const trimmed = password.trim();
  if (!trimmed) {
    return { success: false, message: 'تکایە وشەی نهێنی یان PIN بنووسە!' };
  }

  const customPinHash = typeof window !== 'undefined' ? localStorage.getItem(CUSTOM_PIN_KEY) : null;
  const employees = getEmployees();

  // 1. Try server login
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        password: trimmed, 
        customPinHash, 
        remember, 
        username: username?.trim(),
        employees 
      }),
    });

    const data = await res.json();

    if (res.status === 429) {
      return { success: false, message: data.message, rateLimited: true };
    }

    if (data.success && data.token && data.user) {
      const sessionUser: UserSession = data.user;
      const session: AuthSession = {
        token: data.token,
        expiresAt: data.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
        user: sessionUser,
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
      return { success: true, user: sessionUser };
    }

    return { success: false, message: data.message || 'وشەی نهێنی یان هەژمار هەڵەیە!' };
  } catch {
    // 2. Offline fallback verification
    const matched = await resolveUserCredentials(trimmed, username);
    if (matched) {
      if (matched.status === 'inactive') {
        return { success: false, message: 'ئەم هەژمارە لەلایەن بەڕێوەبەرەوە ناچالاک کراوە!' };
      }

      const sessionUser: UserSession = {
        id: matched.id,
        name: matched.name,
        username: matched.username,
        role: matched.role,
        phone: matched.phone,
      };

      await createSession(sessionUser, remember);
      return { success: true, user: sessionUser };
    }

    return { success: false, message: 'وشەی نهێنی یان PIN هەڵەیە! تکایە زانیاری دروست بنووسە.' };
  }
}

/**
 * Match credentials against Admin master keys or Employee accounts
 */
export async function resolveUserCredentials(
  inputPin: string,
  username?: string
): Promise<Employee | null> {
  const trimmed = inputPin.trim();
  const trimmedUser = username?.trim().toLowerCase();

  // A. Check Custom Admin PIN
  if (typeof window !== 'undefined') {
    const customHash = localStorage.getItem(CUSTOM_PIN_KEY);
    if (customHash) {
      const inputHash = await sha256(trimmed);
      if (inputHash === customHash) {
        return {
          id: 'emp-admin',
          name: 'بەڕێوەبەری گشتی (Admin)',
          username: 'admin',
          pin: trimmed,
          role: 'admin',
          status: 'active',
          created_at: '2026-01-01T00:00:00.000Z',
        };
      }
    }
  }

  // B. Check Employee Accounts
  const employees = getEmployees();

  // If username provided, match username + pin
  if (trimmedUser) {
    const emp = employees.find(
      (e) => e.username.toLowerCase() === trimmedUser && e.pin === trimmed
    );
    if (emp) return emp;
  }

  // Also allow direct PIN login
  const empByPin = employees.find((e) => e.pin === trimmed);
  if (empByPin) return empByPin;

  return null;
}

/**
 * Create and persist authenticated session locally
 */
export async function createSession(
  user: UserSession,
  remember: boolean = true
): Promise<AuthSession> {
  const token = await sha256('authenticated_' + Date.now() + Math.random());
  const duration = remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const session: AuthSession = {
    token,
    expiresAt: Date.now() + duration,
    createdAt: Date.now(),
    user,
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
 * Get active user session synchronously
 */
export function getCurrentUser(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const session: AuthSession = JSON.parse(raw);
      if (session && session.user && session.expiresAt && session.expiresAt > Date.now()) {
        return session.user;
      }
    }

    // Legacy fallback check
    const legacyUnlocked =
      localStorage.getItem(LEGACY_STORAGE_KEY) === 'true' ||
      sessionStorage.getItem(LEGACY_STORAGE_KEY) === 'true';

    if (legacyUnlocked) {
      return {
        id: 'emp-admin',
        name: 'بەڕێوەبەری گشتی (Admin)',
        username: 'admin',
        role: 'admin',
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Check whether the current user holds an active, unexpired session
 */
export async function checkServerSession(): Promise<{ authenticated: boolean; user?: UserSession }> {
  try {
    const res = await fetch('/api/auth/session');
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.user) {
        return { authenticated: true, user: data.user };
      }
    }
  } catch {
    // Network error: fall back to local check
  }

  const localUser = getCurrentUser();
  if (localUser) {
    return { authenticated: true, user: localUser };
  }
  return { authenticated: false };
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
