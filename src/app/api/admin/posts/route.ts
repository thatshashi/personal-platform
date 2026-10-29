import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { slugify, calculateReadingTime } from '@/lib/utils';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, subtitle, slug, contentMarkdown, excerpt, category, tags, status } = body;

    if (!title || !contentMarkdown || !category) {
      return NextResponse.json({ error: 'Title, category, and markdown content are required.' }, { status: 400 });
    }

    const postSlug = slug ? slugify(slug) : slugify(title);
    const readingTime = calculateReadingTime(contentMarkdown);
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : []);
    const now = new Date().toISOString();
    const publishedAt = status === 'published' ? now : null;

    const db = getDb();

    if (id) {
      // Update existing post
      db.prepare(`
        UPDATE posts
        SET slug = ?, title = ?, subtitle = ?, content_markdown = ?, excerpt = ?, category = ?, tags_json = ?, status = ?, reading_time_min = ?, updated_at = ?, published_at = COALESCE(published_at, ?)
        WHERE id = ?
      `).run(
        postSlug,
        title.trim(),
        subtitle ? subtitle.trim() : null,
        contentMarkdown,
        excerpt ? excerpt.trim() : null,
        category.trim(),
        tagsJson,
        status || 'draft',
        readingTime,
        now,
        publishedAt,
        id
      );

      logAuditEvent('post_updated', admin.username, { id, title: title.trim(), status });
      return NextResponse.json({ success: true, id, slug: postSlug });
    } else {
      // Create new post
      const newId = 'post_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO posts (
          id, slug, title, subtitle, content_markdown, excerpt, category, tags_json, status, reading_time_min, created_at, updated_at, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        postSlug,
        title.trim(),
        subtitle ? subtitle.trim() : null,
        contentMarkdown,
        excerpt ? excerpt.trim() : null,
        category.trim(),
        tagsJson,
        status || 'draft',
        readingTime,
        now,
        now,
        publishedAt
      );

      logAuditEvent('post_created', admin.username, { id: newId, title: title.trim(), status });
      return NextResponse.json({ success: true, id: newId, slug: postSlug });
    }
  } catch (err: any) {
    console.error('Error saving post:', err);
    return NextResponse.json({ error: err.message || 'Failed to save post' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM posts WHERE id = ?').run(id);

    logAuditEvent('post_deleted', admin.username, { id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete post' }, { status: 500 });
  }
}
