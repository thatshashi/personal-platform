import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { invalidateSession, SESSION_COOKIE_NAME, logAuditEvent } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      invalidateSession(token);
      logAuditEvent('admin_logout', 'session');
    }

    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Logout error' }, { status: 500 });
  }
}
