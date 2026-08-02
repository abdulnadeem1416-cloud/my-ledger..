/**
 * Utility functions for offline secure authentication using Web Crypto API.
 */

// SHA-256 Hashing helper using standard browser Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_myledger_vault_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getStoredAuth(): { loginId: string | null; passwordHash: string | null; isSetup: boolean } {
  try {
    const loginId = localStorage.getItem('myledger_auth_login_id');
    const passwordHash = localStorage.getItem('myledger_auth_password_hash');
    const isSetup = Boolean(loginId && passwordHash);
    return { loginId, passwordHash, isSetup };
  } catch {
    return { loginId: null, passwordHash: null, isSetup: false };
  }
}

export function saveStoredAuth(loginId: string, passwordHash: string): void {
  localStorage.setItem('myledger_auth_login_id', loginId.trim());
  localStorage.setItem('myledger_auth_password_hash', passwordHash);
}

export function clearStoredAuth(): void {
  localStorage.removeItem('myledger_auth_login_id');
  localStorage.removeItem('myledger_auth_password_hash');
}
