import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createSession, checkRateLimit, logAuditEvent, SESSION_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `login_${clientIp}_${username}`;

    if (!checkRateLimit(rateLimitKey, 5, 300)) {
      logAuditEvent('login_rate_limited', username || 'unknown', {}, clientIp);
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please wait 5 minutes before retrying.' },
        { status: 429 }
      );
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;

    if (!user || !verifyPassword(password, user.password_hash)) {
      logAuditEvent('admin_login_failed', username, { reason: 'Invalid credentials' }, clientIp);
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    // Create session
    const { token, expiresAt } = createSession(user.id);

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt)
    });

    logAuditEvent('admin_login_success', user.username, { userId: user.id }, clientIp);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Server login error' }, { status: 500 });
  }
}
