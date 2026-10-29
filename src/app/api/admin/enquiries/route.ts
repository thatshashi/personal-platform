import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const enquiries = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all();
  return NextResponse.json({ enquiries });
}

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE enquiries
      SET status = COALESCE(?, status),
          admin_notes = COALESCE(?, admin_notes),
          updated_at = ?
      WHERE id = ?
    `).run(status || null, adminNotes || null, now, id);

    logAuditEvent('enquiry_status_updated', admin.username, { id, status });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating enquiry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const db = getDb();
    db.prepare('DELETE FROM enquiries WHERE id = ?').run(id);

    logAuditEvent('enquiry_deleted', admin.username, { id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting enquiry' }, { status: 500 });
  }
}
