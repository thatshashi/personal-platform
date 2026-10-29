import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'ag_admin_session';
const SESSION_DURATION_DAYS = 7;

// In-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowSec = 300): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count += 1;
  return true;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function hasAdminUser(): boolean {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
  return row.count > 0;
}

export function createAdminUser(username: string, email: string, password: string): { success: boolean; error?: string } {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) {
    return { success: false, error: 'Username or email already exists' };
  }

  const id = 'usr_' + crypto.randomUUID().slice(0, 8);
  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, 'admin', ?)
  `).run(id, username.trim(), email.trim().toLowerCase(), passwordHash, now);

  logAuditEvent('admin_created', username, { email });
  return { success: true };
}

export function createSession(userId: string): { token: string; expiresAt: string } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userId, expiresAt, now);

  // Update user last login
  db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, userId);

  return { token, expiresAt };
}

export function getSessionUser(token: string): { id: string; username: string; email: string; role: string } | null {
  if (!token) return null;
  const db = getDb();
  const now = new Date().toISOString();

  const session = db.prepare(`
    SELECT s.token, u.id, u.username, u.email, u.role, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, now) as any;

  if (!session) return null;

  return {
    id: String(session.id),
    username: String(session.username),
    email: String(session.email),
    role: String(session.role)
  };
}

export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return getSessionUser(token);
  } catch {
    return null;
  }
}

export function invalidateSession(token: string) {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function logAuditEvent(action: string, actor: string, details: Record<string, unknown> = {}, ip?: string) {
  try {
    const db = getDb();
    const id = 'log_' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO audit_logs (id, action, actor, details_json, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, action, actor, JSON.stringify(details), ip || '127.0.0.1', now);
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

export { SESSION_COOKIE_NAME };
