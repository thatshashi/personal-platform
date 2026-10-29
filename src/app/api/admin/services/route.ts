import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const services = db.prepare('SELECT * FROM services ORDER BY order_index ASC').all();
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const {
      id, name, slug, description, category, pricingModel, priceCents, currency,
      deliverables, exclusions, estimatedDays, requiredInfoPrompt, termsNotes,
      active, featured, orderIndex
    } = body;

    if (!name || !description || !category) {
      return NextResponse.json({ error: 'Name, description, and category are required' }, { status: 400 });
    }

    const sSlug = slug ? slugify(slug) : slugify(name);
    const deliverablesJson = JSON.stringify(
      Array.isArray(deliverables) ? deliverables : typeof deliverables === 'string' ? deliverables.split('\n').map((d: string) => d.trim()).filter(Boolean) : []
    );
    const exclusionsJson = JSON.stringify(
      Array.isArray(exclusions) ? exclusions : typeof exclusions === 'string' ? exclusions.split('\n').map((e: string) => e.trim()).filter(Boolean) : []
    );

    const db = getDb();
    const now = new Date().toISOString();

    if (id) {
      db.prepare(`
        UPDATE services
        SET slug = ?, name = ?, description = ?, category = ?, pricing_model = ?, price_cents = ?, currency = ?,
            deliverables_json = ?, exclusions_json = ?, estimated_days = ?, required_info_prompt = ?, terms_notes = ?,
            active = ?, featured = ?, order_index = ?, updated_at = ?
        WHERE id = ?
      `).run(
        sSlug,
        name.trim(),
        description.trim(),
        category.trim(),
        pricingModel || 'fixed',
        Number(priceCents) || 0,
        currency || 'INR',
        deliverablesJson,
        exclusionsJson,
        Number(estimatedDays) || 7,
        requiredInfoPrompt ? requiredInfoPrompt.trim() : null,
        termsNotes ? termsNotes.trim() : null,
        active ? 1 : 0,
        featured ? 1 : 0,
        Number(orderIndex) || 0,
        now,
        id
      );

      logAuditEvent('service_updated', admin.username, { id, name });
      return NextResponse.json({ success: true, id });
    } else {
      const newId = 'srv_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO services (
          id, slug, name, description, category, pricing_model, price_cents, currency,
          deliverables_json, exclusions_json, estimated_days, required_info_prompt, terms_notes,
          active, featured, order_index, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        sSlug,
        name.trim(),
        description.trim(),
        category.trim(),
        pricingModel || 'fixed',
        Number(priceCents) || 0,
        currency || 'INR',
        deliverablesJson,
        exclusionsJson,
        Number(estimatedDays) || 7,
        requiredInfoPrompt ? requiredInfoPrompt.trim() : null,
        termsNotes ? termsNotes.trim() : null,
        active ? 1 : 0,
        featured ? 1 : 0,
        Number(orderIndex) || 0,
        now,
        now
      );

      logAuditEvent('service_created', admin.username, { id: newId, name });
      return NextResponse.json({ success: true, id: newId });
    }
  } catch (err: any) {
    console.error('Error saving service:', err);
    return NextResponse.json({ error: err.message || 'Error saving service' }, { status: 500 });
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
    db.prepare('DELETE FROM services WHERE id = ?').run(id);

    logAuditEvent('service_deleted', admin.username, { id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting service' }, { status: 500 });
  }
}
