import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import CheckoutClient from './CheckoutClient';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

interface CheckoutPageProps {
  params: Promise<{ serviceSlug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { serviceSlug } = await params;
  const db = getDb();

  const service = db.prepare('SELECT * FROM services WHERE slug = ? AND active = 1').get(serviceSlug) as any;
  if (!service) {
    notFound();
  }

  return (
    <div className="section-padding">
      <div className="container">
        <Link href={`/services/${service.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <ArrowLeft size={16} />
          <span>Back to service details</span>
        </Link>

        <CheckoutClient service={JSON.parse(JSON.stringify(service))} />
      </div>
    </div>
  );
}
