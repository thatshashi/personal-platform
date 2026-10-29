import { NextResponse } from 'next/server';
import { hasAdminUser, createAdminUser, createSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const adminExists = hasAdminUser();
  return NextResponse.json({ setupRequired: !adminExists });
}

export async function POST(request: Request) {
  try {
    if (hasAdminUser()) {
      return NextResponse.json(
        { error: 'Initial administrator account already exists. Setup is disabled.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const result = createAdminUser(username, email, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to create user' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Administrator initialized successfully.' });
  } catch (err: any) {
    console.error('Setup error:', err);
    return NextResponse.json({ error: err.message || 'Setup error' }, { status: 500 });
  }
}
