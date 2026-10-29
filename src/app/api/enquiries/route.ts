import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/lib/db';
import { checkRateLimit, logAuditEvent } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, category, budgetRange, timeline, message, honeypot } = body;

    // Anti-spam honeypot detection
    if (honeypot) {
      // Silently accept without saving or return success to frustrate spam bots
      return NextResponse.json({ success: true, message: 'Enquiry received.' });
    }

    // Rate limiting by IP or email
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `enquiry_${clientIp}`;
    if (!checkRateLimit(rateLimitKey, 5, 300)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const db = getDb();
    const id = 'enq_' + crypto.randomUUID().slice(0, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO enquiries (
        id, name, email, category, budget_range, timeline, message, custom_fields_json, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, '{}', 'new', ?, ?)
    `).run(
      id,
      name.trim(),
      email.trim().toLowerCase(),
      category || 'General',
      budgetRange || '',
      timeline || '',
      message.trim(),
      now,
      now
    );

    logAuditEvent('enquiry_submitted', name, { email, category, enquiryId: id }, clientIp);

    return NextResponse.json({
      success: true,
      message: 'Your enquiry has been securely received and recorded in our queue.'
    });
  } catch (err: any) {
    console.error('Error handling enquiry:', err);
    return NextResponse.json({ error: 'Internal server error processing enquiry' }, { status: 500 });
  }
}
