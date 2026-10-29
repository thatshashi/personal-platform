import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const principles = db.prepare('SELECT * FROM principles ORDER BY order_index ASC').all();
  return NextResponse.json({ principles });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, title, category, statement, rationale, evolutionNotes, active, orderIndex } = body;

    if (!title || !statement) {
      return NextResponse.json({ error: 'Title and statement are required' }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();

    if (id) {
      db.prepare(`
        UPDATE principles
        SET title = ?, category = ?, statement = ?, rationale = ?, evolution_notes = ?,
            active = ?, order_index = ?, updated_at = ?
        WHERE id = ?
      `).run(
        title.trim(),
        category || 'principle',
        statement.trim(),
        rationale ? rationale.trim() : null,
        evolutionNotes ? evolutionNotes.trim() : null,
        active ? 1 : 0,
        Number(orderIndex) || 0,
        now,
        id
      );

      logAuditEvent('principle_updated', admin.username, { id, title });
      return NextResponse.json({ success: true, id });
    } else {
      const newId = 'pr_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO principles (
          id, title, category, statement, rationale, evolution_notes, active, order_index, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        title.trim(),
        category || 'principle',
        statement.trim(),
        rationale ? rationale.trim() : null,
        evolutionNotes ? evolutionNotes.trim() : null,
        active ? 1 : 0,
        Number(orderIndex) || 0,
        now,
        now
      );

      logAuditEvent('principle_created', admin.username, { id: newId, title });
      return NextResponse.json({ success: true, id: newId });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error saving principle' }, { status: 500 });
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
    db.prepare('DELETE FROM principles WHERE id = ?').run(id);

    logAuditEvent('principle_deleted', admin.username, { id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting principle' }, { status: 500 });
  }
}
