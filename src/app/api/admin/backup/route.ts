import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getCurrentAdmin, logAuditEvent } from '@/lib/auth';

const DB_PATH = path.join(process.cwd(), 'data', 'platform.db');

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!fs.existsSync(DB_PATH)) {
    return NextResponse.json({ error: 'Database file not found' }, { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(DB_PATH);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `platform-backup-${dateStr}.db`;

    logAuditEvent('database_backup_downloaded', admin.username, { filename });

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.sqlite3',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error exporting database' }, { status: 500 });
  }
}
