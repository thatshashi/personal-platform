import type { Metadata } from 'next';
import './globals.css';
import { getDb } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const db = getDb();
    const titleRow = db.prepare("SELECT value FROM settings WHERE key = 'site_title'").get() as { value: string } | undefined;
    const tagRow = db.prepare("SELECT value FROM settings WHERE key = 'site_tagline'").get() as { value: string } | undefined;

    const title = titleRow?.value || 'Personal Platform & Studio';
    const description = tagRow?.value || 'Technology, Software Engineering, Business Automation & Practical Guidance';

    return {
      title: {
        default: title,
        template: `%s | ${title}`
      },
      description,
      metadataBase: new URL('http://localhost:3000'),
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en_US',
      },
      robots: {
        index: true,
        follow: true
      }
    };
  } catch {
    return {
      title: 'Personal Platform & Studio',
      description: 'Technology, Software Engineering, Business Automation & Practical Guidance'
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let siteTitle = 'Platform';
  let tagline = '';
  let contactEmail = '';
  let hasAdmin = false;

  try {
    const db = getDb();
    const titleRow = db.prepare("SELECT value FROM settings WHERE key = 'site_title'").get() as { value: string } | undefined;
    const tagRow = db.prepare("SELECT value FROM settings WHERE key = 'site_tagline'").get() as { value: string } | undefined;
    const emailRow = db.prepare("SELECT value FROM settings WHERE key = 'contact_email'").get() as { value: string } | undefined;

    if (titleRow) siteTitle = titleRow.value;
    if (tagRow) tagline = tagRow.value;
    if (emailRow) contactEmail = emailRow.value;

    const admin = await getCurrentAdmin();
    hasAdmin = Boolean(admin);
  } catch (err) {
    console.error('Layout DB error:', err);
  }

  return (
    <html lang="en">
      <body>
        <Navbar siteTitle={siteTitle} hasAdminSession={hasAdmin} />
        <main>{children}</main>
        <Footer siteTitle={siteTitle} tagline={tagline} contactEmail={contactEmail} />
      </body>
    </html>
  );
}
