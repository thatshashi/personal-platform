import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const projects = db.prepare('SELECT * FROM projects ORDER BY order_index ASC').all();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const {
      id, title, slug, summary, problem, contribution, techStack,
      outcomes, liveUrl, repoUrl, category, tags, stage, featured, orderIndex
    } = body;

    if (!title || !summary || !contribution || !category) {
      return NextResponse.json({ error: 'Title, summary, contribution, and category are required' }, { status: 400 });
    }

    const pSlug = slug ? slugify(slug) : slugify(title);
    const techStackJson = JSON.stringify(
      Array.isArray(techStack) ? techStack : typeof techStack === 'string' ? techStack.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    );
    const tagsJson = JSON.stringify(
      Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    );

    const db = getDb();
    const now = new Date().toISOString();

    if (id) {
      db.prepare(`
        UPDATE projects
        SET slug = ?, title = ?, summary = ?, problem = ?, contribution = ?,
            tech_stack_json = ?, outcomes = ?, live_url = ?, repo_url = ?,
            category = ?, tags_json = ?, stage = ?, featured = ?, order_index = ?, updated_at = ?
        WHERE id = ?
      `).run(
        pSlug,
        title.trim(),
        summary.trim(),
        problem ? problem.trim() : null,
        contribution.trim(),
        techStackJson,
        outcomes ? outcomes.trim() : null,
        liveUrl ? liveUrl.trim() : null,
        repoUrl ? repoUrl.trim() : null,
        category.trim(),
        tagsJson,
        stage || 'completed',
        featured ? 1 : 0,
        Number(orderIndex) || 0,
        now,
        id
      );

      logAuditEvent('project_updated', admin.username, { id, title });
      return NextResponse.json({ success: true, id });
    } else {
      const newId = 'proj_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO projects (
          id, slug, title, summary, problem, contribution, tech_stack_json, outcomes,
          live_url, repo_url, category, tags_json, stage, featured, order_index, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        pSlug,
        title.trim(),
        summary.trim(),
        problem ? problem.trim() : null,
        contribution.trim(),
        techStackJson,
        outcomes ? outcomes.trim() : null,
        liveUrl ? liveUrl.trim() : null,
        repoUrl ? repoUrl.trim() : null,
        category.trim(),
        tagsJson,
        stage || 'completed',
        featured ? 1 : 0,
        Number(orderIndex) || 0,
        now,
        now
      );

      logAuditEvent('project_created', admin.username, { id: newId, title });
      return NextResponse.json({ success: true, id: newId });
    }
  } catch (err: any) {
    console.error('Error saving project:', err);
    return NextResponse.json({ error: err.message || 'Error saving project' }, { status: 500 });
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
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    logAuditEvent('project_deleted', admin.username, { id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting project' }, { status: 500 });
  }
}
