import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { orderId, paymentStatus, fulfillmentStatus, notes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE orders
      SET payment_status = COALESCE(?, payment_status),
          fulfillment_status = COALESCE(?, fulfillment_status),
          notes = COALESCE(?, notes),
          updated_at = ?
      WHERE id = ?
    `).run(paymentStatus || null, fulfillmentStatus || null, notes || null, now, orderId);

    logAuditEvent('order_updated', admin.username, { orderId, paymentStatus, fulfillmentStatus });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating order' }, { status: 500 });
  }
}
