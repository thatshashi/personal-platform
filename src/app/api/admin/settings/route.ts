import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const db = getDb();
    const now = new Date().toISOString();

    const upsertStmt = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

    for (const [k, v] of Object.entries(body)) {
      if (typeof v === 'string') {
        upsertStmt.run(k, v, now);
      }
    }

    logAuditEvent('settings_updated', admin.username, { updatedKeys: Object.keys(body) });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating settings' }, { status: 500 });
  }
}
