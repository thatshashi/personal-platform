import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'platform.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL,
      last_login TEXT
    );
  `);

  // Admin sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Blog posts
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      content_markdown TEXT NOT NULL,
      excerpt TEXT,
      category TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      cover_image TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      reading_time_min INTEGER DEFAULT 5,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );
  `);

  // Projects / Portfolio
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      problem TEXT,
      contribution TEXT NOT NULL,
      tech_stack_json TEXT NOT NULL DEFAULT '[]',
      outcomes TEXT,
      live_url TEXT,
      repo_url TEXT,
      cover_image TEXT,
      gallery_json TEXT NOT NULL DEFAULT '[]',
      category TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      stage TEXT NOT NULL DEFAULT 'completed',
      featured INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Services Marketplace
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      pricing_model TEXT NOT NULL DEFAULT 'fixed',
      price_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      deliverables_json TEXT NOT NULL DEFAULT '[]',
      exclusions_json TEXT NOT NULL DEFAULT '[]',
      estimated_days INTEGER DEFAULT 7,
      required_info_prompt TEXT,
      terms_notes TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Personal Principles & Evolving Opinions
  db.exec(`
    CREATE TABLE IF NOT EXISTS principles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'principle',
      statement TEXT NOT NULL,
      rationale TEXT,
      evolution_notes TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Interests, Games & Tech
  db.exec(`
    CREATE TABLE IF NOT EXISTS interests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'gaming',
      description TEXT NOT NULL,
      status_tag TEXT,
      rating_or_experience TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Technology & Buying Guides
  db.exec(`
    CREATE TABLE IF NOT EXISTS buying_guides (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      category TEXT NOT NULL,
      budget_tier TEXT,
      criteria_json TEXT NOT NULL DEFAULT '[]',
      recommendations_json TEXT NOT NULL DEFAULT '[]',
      avoid_list_json TEXT NOT NULL DEFAULT '[]',
      last_verified_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Enquiries & Client Requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      category TEXT NOT NULL,
      budget_range TEXT,
      timeline TEXT,
      message TEXT NOT NULL,
      custom_fields_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'new',
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Customer Orders & Bookings
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      service_id TEXT,
      service_name TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      pricing_model TEXT NOT NULL,
      requirements_submitted TEXT,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_provider TEXT NOT NULL DEFAULT 'mock_sandbox',
      payment_reference TEXT,
      fulfillment_status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Media Library
  db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      path_or_url TEXT NOT NULL,
      alt_text TEXT,
      caption TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Security and Operational Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      details_json TEXT NOT NULL DEFAULT '{}',
      ip_address TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Seed default data if empty
  seedInitialData(db);
}

function seedInitialData(db: DatabaseSync) {
  // Check if settings table is populated
  const stmt = db.prepare('SELECT COUNT(*) as count FROM settings');
  const result = stmt.get() as { count: number };
  if (result.count > 0) return;

  const now = new Date().toISOString();

  // Insert default settings
  const defaultSettings: Record<string, string> = {
    site_title: 'Personal Platform & Studio',
    site_tagline: 'Technology, Software Engineering, Business Automation & Practical Guidance',
    owner_name: 'Platform Operator',
    owner_bio: 'Engineer, systems builder, and consultant working on digital products, workflow automation, and technology advice.',
    contact_email: 'contact@example.com',
    currency: 'INR',
    currency_symbol: '₹',
    payment_mode: 'mock_sandbox', // 'mock_sandbox' | 'razorpay' | 'stripe'
    github_url: 'https://github.com',
    twitter_url: '',
    linkedin_url: '',
    maintenance_mode: '0',
    services_notice: 'Currently taking selected projects and consultation inquiries for Q4.',
  };

  const insertSetting = db.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)');
  for (const [k, v] of Object.entries(defaultSettings)) {
    insertSetting.run(k, v, now);
  }

  // Seed initial services
  const insertService = db.prepare(`
    INSERT INTO services (
      id, slug, name, description, category, pricing_model, price_cents, currency,
      deliverables_json, exclusions_json, estimated_days, required_info_prompt, terms_notes,
      active, featured, order_index, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertService.run(
    'srv-1',
    'web-app-architecture-and-build',
    'Full-Stack Web Application / MVP',
    'Design, develop, and deploy a production-grade web application tailored to your operational or customer workflow.',
    'Development',
    'fixed',
    7500000, // ₹75,000
    'INR',
    JSON.stringify([
      'Complete full-stack web application (Next.js / Node / SQLite or Postgres)',
      'Responsive, accessible, custom design system without generic templates',
      'Secure authentication, session management, and admin dashboard',
      'Automated database migrations, backup script, and deployment configuration',
      'Full source code ownership, repository setup, and 30-day post-launch support'
    ]),
    JSON.stringify([
      'Third-party software subscription fees',
      'Custom native mobile app compilation (web app is mobile responsive)',
      'Unbounded scope changes after initial specification approval'
    ]),
    21,
    'Please outline the primary purpose of the application, target users, and key workflows you need.',
    '50% deposit to initiate milestone sprints. Revisions included within agreed functional scope.',
    1, 1, 1, now, now
  );

  insertService.run(
    'srv-2',
    'business-automation-and-chatbots',
    'Workflow Automation & Intelligent Bot',
    'Automate manual data entry, customer intake, and business operations with custom automation workflows and AI-assisted triage.',
    'Automation',
    'fixed',
    3500000, // ₹35,000
    'INR',
    JSON.stringify([
      'Custom webhook triggers and data transformation pipelines',
      'Secure API integrations (CRM, billing, communication platforms)',
      'Automated customer inquiry classification or support triage bot',
      'Error alerting, fallback handling, and operational runbook'
    ]),
    JSON.stringify([
      'External API usage costs (e.g. OpenAI / WhatsApp Business API fees)',
      'Manual daily data entry on your behalf'
    ]),
    10,
    'Describe the manual task or workflow that takes the most time each week.',
    'Includes 14 days of monitoring and adjustments after launch.',
    1, 1, 2, now, now
  );

  insertService.run(
    'srv-3',
    'tech-buying-and-architecture-consultation',
    'Technical Strategy & Architecture Consultation',
    'A 90-minute focused consultation to evaluate hardware/software purchasing, stack selection, or system architecture before you commit capital.',
    'Consultation',
    'consultation',
    500000, // ₹5,000
    'INR',
    JSON.stringify([
      '90-minute direct video or call consultation',
      'Pre-call review of your requirements, current specs, or vendor proposals',
      'Post-call written summary with actionable recommendations and alternatives',
      'Unbiased advice: zero affiliate bias or vendor kickbacks'
    ]),
    JSON.stringify([
      'Hands-on coding during the consultation call',
      'Endless open-ended messaging after call completion'
    ]),
    2,
    'What hardware, software, or architectural decision are you currently facing?',
    'Rescheduling permitted with 24-hour notice. Full refund if cancelled 24 hours prior.',
    1, 1, 3, now, now
  );

  insertService.run(
    'srv-4',
    'custom-technical-project',
    'Custom Technical Project / Audit',
    'Submit requirements for specialized technical projects, database optimization, code audits, or exploratory tools.',
    'Custom',
    'custom_quote',
    0,
    'INR',
    JSON.stringify([
      'Tailored scope of work with milestone deliverables',
      'Detailed technical audit or implementation plan',
      'Direct communication channel with transparent progress updates'
    ]),
    JSON.stringify([
      'Unverified feasibility projects without discovery phase'
    ]),
    14,
    'Describe your project goals, technical constraints, and target timeline.',
    'Quotation provided within 48 hours of discovery.',
    1, 0, 4, now, now
  );

  // Seed initial projects
  const insertProject = db.prepare(`
    INSERT INTO projects (
      id, slug, title, summary, problem, contribution, tech_stack_json, outcomes,
      live_url, repo_url, cover_image, gallery_json, category, tags_json, stage,
      featured, order_index, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProject.run(
    'proj-1',
    'unified-personal-business-platform',
    'Unified Personal Platform & Digital Business Engine',
    'A full-stack, self-hosted web platform combining publishing, service marketplace, interactive tools, and administrative operations.',
    'Personal websites are often static portfolios disconnected from actual business operations, requiring multiple disparate SaaS tools for payments, blogs, and inquiries.',
    'Sole architect and developer. Designed and built the complete system from design tokens and relational data schema to secure auth, order workflows, and interactive tools.',
    JSON.stringify(['TypeScript', 'Next.js', 'Node.js', 'SQLite', 'Vanilla CSS']),
    'Single unified deployment replacing 4 separate subscriptions; sub-100ms server response times with zero client bloat.',
    '/',
    'https://github.com',
    '/assets/projects/platform.svg',
    JSON.stringify([]),
    'Web Applications',
    JSON.stringify(['Full-Stack', 'E-Commerce', 'Publishing', 'Admin Dashboard']),
    'completed',
    1, 1, now, now
  );

  insertProject.run(
    'proj-2',
    'high-precision-document-extractor',
    'High-Precision Document Processing Pipeline',
    'An automated ingestion engine that parses complex financial receipts and contracts into validated relational records.',
    'Manual entry of vendor invoices was error-prone, costing operations teams hours of tedious reconciliation each month.',
    'Engineered regex and layout-aware parser with confidence scoring, automated schema validation, and discrepancy alerting.',
    JSON.stringify(['Node.js', 'TypeScript', 'SQLite', 'Workers']),
    'Reduced document reconciliation time by over 80% while flagging 99.4% of layout anomalies before database insertion.',
    '',
    '',
    '/assets/projects/extractor.svg',
    JSON.stringify([]),
    'Automation',
    JSON.stringify(['Automation', 'Data Pipelines', 'Node.js']),
    'completed',
    1, 2, now, now
  );

  insertProject.run(
    'proj-3',
    'tech-spec-decision-engine',
    'Interactive Tech Spec & Hardware Decision Engine',
    'A browser-based diagnostic tool helping developers and creators select hardware setups according to real thermal and compile benchmarks.',
    'Product comparison sites are filled with affiliate spam and manufactured hype without real workload considerations.',
    'Compiled benchmark datasets across workloads (compilation, video rendering, thermal throttling) into an interactive client-side selector.',
    JSON.stringify(['TypeScript', 'Web Standards', 'Vanilla CSS']),
    'Provides instant, unbiased recommendations based on real constraints without external tracking or sponsored placements.',
    '/playground',
    '',
    '/assets/projects/spec-tool.svg',
    JSON.stringify([]),
    'Interactive Tools',
    JSON.stringify(['Diagnostics', 'Benchmarks', 'Frontend']),
    'completed',
    1, 3, now, now
  );

  // Seed initial principles
  const insertPrinciple = db.prepare(`
    INSERT INTO principles (
      id, title, category, statement, rationale, evolution_notes, active, order_index, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPrinciple.run(
    'pr-1',
    'Respect User Agency & Time',
    'principle',
    'Never build manipulative interfaces: no fake scarcity, no forced logins for basic info, and no unskippable sales funnels.',
    'If a product has genuine utility, customers will engage with it. Manufactured urgency degrades trust faster than any competitor can.',
    'Originally formulated in 2023 when seeing SaaS platforms obscure pricing behind mandatory sales calls.',
    1, 1, now, now
  );

  insertPrinciple.run(
    'pr-2',
    'Simplicity Outlasts Cleverness',
    'principle',
    'Prefer plain, battle-tested tools with minimal moving parts over volatile trend-driven architectures.',
    'Every extra service, microservice, or abstract layer in your stack is a potential 3 AM failure point and a cognitive tax on future changes.',
    'Reaffirmed after observing dozens of projects collapse under the weight of premature distributed systems.',
    1, 2, now, now
  );

  insertPrinciple.run(
    'pr-3',
    'Honest Limits Beat False Confidence',
    'opinion',
    'It is infinitely better to say "I don\'t know, but I will find out" or "I am not the right person for this project" than to bluff competence.',
    'Bluffing wastes client capital and destroys professional credibility. Clients appreciate clear boundaries as much as clear solutions.',
    'Continues to be one of the most reliable filters for healthy client relationships.',
    1, 3, now, now
  );

  insertPrinciple.run(
    'pr-4',
    'Tool Selection Should Follow Problem Shape',
    'observation',
    'Do not force every problem into a predefined technology hammer just because you like the syntax.',
    'Sometimes a 50-line bash script solves what a 10-person team tried to build in Kubernetes. Match architecture to the problem scale.',
    'Added after refactoring an overengineered message queue back into a clean SQLite table.',
    1, 4, now, now
  );

  // Seed initial blog posts
  const insertPost = db.prepare(`
    INSERT INTO posts (
      id, slug, title, subtitle, content_markdown, excerpt, category, tags_json, cover_image, status, reading_time_min, created_at, updated_at, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPost.run(
    'post-1',
    'why-we-dont-need-microservices-for-everything',
    'Why Most Products Don\'t Need Microservices',
    'Reflections on operational reality, cognitive overhead, and the timeless reliability of the modular monolith.',
    `There is a recurring pattern in software engineering: an engineering team reads an architecture paper written by a company with tens of thousands of engineers, billions of daily active users, and specialized infrastructure teams. The team decides that to be modern, they must adopt the exact same architecture for a system handling a few hundred requests a minute.

The result is rarely speed or agility. The result is:
- Distributed transactions that fail silently.
- Network latencies masquerading as application bugs.
- Complex local development environments requiring container orchestrators just to run an integration test.
- A fragmented mental model where no single person understands how data flows end-to-end.

### The Power of the Modular Monolith

For 95% of businesses and digital products, a well-structured modular monolith running on a single robust server or container will:
1. Deliver sub-50ms query responses without network RPC hops.
2. Allow instant refactoring with compiler-backed type safety.
3. Keep operational costs low and predictable.
4. Let you focus on product iteration rather than Kubernetes ingress controllers.

### When To Actually Split

Split when organizational boundaries demand it—when two autonomous teams cannot ship independently due to code collisions, or when a specific service has drastically mismatched hardware requirements (e.g. GPU compute for inference vs. standard HTTP CRUD).

Until you reach that scale, cherish the simplicity of a single, well-crafted codebase.`,
    'An honest examination of the hidden costs of microservices and why a modular monolith remains the best starting architecture for almost every product.',
    'Architecture',
    JSON.stringify(['Software Architecture', 'Engineering', 'Monolith']),
    '/assets/blog/architecture.svg',
    'published',
    4,
    now, now, now
  );

  insertPost.run(
    'post-2',
    'buying-laptops-for-developers-without-the-hype',
    'A Practical Guide to Buying Developer Laptops',
    'Cut through marketing jargon: what actually matters for compilation, thermals, battery life, and longevity.',
    `Every season brings a flood of hardware announcements with proprietary graphs, arbitrary percentage gains, and marketing terms like "ultra-neural" or "extreme-tier". 

When you spend 8 to 10 hours a day typing code, what actually impacts your daily experience?

### 1. Memory (RAM): Don't Skimp Here
You can survive a moderately slower CPU. You cannot survive constant swap thrashing when you are running a Docker container, an IDE, a local development database, a local dev server, and 30 documentation tabs. 
- **Minimum for modern web/app work:** 32GB unified memory or DDR5.
- **When 16GB is fine:** Lightweight scripting, basic frontend, or cloud-remote environments.

### 2. Sustained Thermals vs. Burst Benchmarks
Single-core burst benchmarks look amazing on spec sheets because they run for 10 seconds. Compiling a large project or bundling assets takes sustained power. If the chassis cannot dissipate heat, the CPU throttles down to a crawl within 90 seconds. Look for reviews that test **sustained 10-minute loops**, not 5-second single runs.

### 3. Display & Keyboard
You look at the screen all day and touch the keyboard constantly. 
- Prefer a 16:10 or 3:2 aspect ratio over 16:9 for vertical code lines.
- Look for matte or anti-reflective coatings if you work near windows.

In our interactive buying guides section on this platform, you can filter and compare specific configurations based on real thermal data and budget.`,
    'Cut through marketing jargon: what actually matters for compilation, thermals, and daily coding comfort.',
    'Technology',
    JSON.stringify(['Hardware', 'Buyer Guides', 'Developer Setup']),
    '/assets/blog/hardware.svg',
    'published',
    5,
    now, now, now
  );

  insertPost.run(
    'post-3',
    'on-taking-projects-you-actually-care-about',
    'On Taking Projects You Actually Care About',
    'Why learning to say a polite "no" to mismatched work is the prerequisite to doing work you are proud to sign your name to.',
    `Early in consulting or freelance work, the instinct is to say yes to every inquiry. Someone wants an obscure legacy integration? Yes. Someone wants an impossible turnaround on a vague specification? Yes.

This instinct comes from fear: fear of scarcity, fear of missed opportunity, fear of being idle.

However, saying yes to mismatched work comes with a hidden, compounding cost:
1. It consumes the cognitive bandwidth you need to build high-quality systems.
2. It generates friction and resentment because expectations were never aligned.
3. It prevents you from being available when an ideal project arrives.

### Setting Clear Boundaries
A transparent service catalogue with clear deliverables, honest pricing, and explicit exclusions is not about being exclusive. It is about honesty:
- Here is what I do exceptionally well.
- Here is what I do not offer.
- Here is what is included, and here is what is out of scope.

When clients see clear boundaries, they don't walk away offended; they feel reassured that they are working with someone who respects both their time and their own craft.`,
    'Reflections on saying no to mismatched work and building professional relationships based on transparency and mutual respect.',
    'Business',
    JSON.stringify(['Consulting', 'Career', 'Principles']),
    '/assets/blog/consulting.svg',
    'published',
    4,
    now, now, now
  );

  // Seed initial interests / games
  const insertInterest = db.prepare(`
    INSERT INTO interests (
      id, title, category, description, status_tag, rating_or_experience, order_index, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertInterest.run(
    'int-1',
    'Strategy & Simulation Games',
    'gaming',
    'Deep logistical simulations, grand strategy, and tactical problem solvers like Factorio, Cities Skylines, and turn-based strategy.',
    'Active',
    '1000+ hours of system optimization',
    1, now
  );

  insertInterest.run(
    'int-2',
    'Mechanical Keyboards & Ergonomics',
    'tech_stack',
    'Split ergonomic layouts, tactile switches with measured actuation points, and ortholinear key arrangements for tendon health.',
    'Daily Driver',
    'Corne / Custom 42-key split',
    2, now
  );

  insertInterest.run(
    'int-3',
    'Local-First Software',
    'curiosities',
    'Software where user data resides on local storage first, with optional CRDT-based background sync rather than centralized cloud dependency.',
    'Exploring',
    'Architectural study',
    3, now
  );

  // Seed initial buying guide
  const insertGuide = db.prepare(`
    INSERT INTO buying_guides (
      id, slug, title, subtitle, category, budget_tier, criteria_json, recommendations_json, avoid_list_json, last_verified_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertGuide.run(
    'guide-1',
    'developer-laptop-buying-guide',
    'Developer Laptop Selection Guide (2025-2026)',
    'Practical recommendations for software engineering, full-stack development, and data analysis.',
    'laptops',
    'mid_to_high',
    JSON.stringify([
      { title: 'RAM Capacity', requirement: 'Minimum 32GB for Docker + IDE + Browser suites' },
      { title: 'Sustained Thermals', requirement: 'Twin fans or vapor chamber with low acoustic pitch' },
      { title: 'Display Ratio', requirement: '16:10 or 3:2 aspect ratio with 400+ nits brightness' },
      { title: 'Battery Longevity', requirement: '70+ Wh battery with USB-C PD charging' }
    ]),
    JSON.stringify([
      {
        tier: 'Balanced All-Rounder (Best Value)',
        model: 'MacBook Pro 14" (M3/M4 Pro, 36GB RAM)',
        pros: ['Remarkable power efficiency (14+ hr battery)', 'Silent operation during standard compilation', 'Exceptional keyboard and trackpad', 'Superb high-DPI display'],
        cons: ['Fixed storage and memory (cannot upgrade after purchase)', 'Higher initial price tag'],
        verdict: 'The most dependable daily workstation for web, mobile, and Unix backend development.'
      },
      {
        tier: 'Best Linux / Upgradable Workhorse',
        model: 'Framework Laptop 16 or ThinkPad T14s AMD (Gen 5)',
        pros: ['User-swappable RAM and storage slots', 'Native Linux kernel support', 'Outstanding keyboard travel and durability', 'Clean port modularity'],
        cons: ['Battery life under peak load is shorter than ARM equivalents', 'Chassis slightly thicker'],
        verdict: 'The ideal choice for engineers who demand repairability, dual-boot setups, and upgrade freedom.'
      }
    ]),
    JSON.stringify([
      'Laptops configured with only 8GB or 16GB non-upgradable soldered RAM for developer workloads.',
      'Thin gaming laptops that throttle CPU clock speeds by 50% after 2 minutes of sustained heat.',
      '4K OLED screens on 13-inch chassis (excessive battery drain with minimal perceptible sharpness benefit over 2.5K).'
    ]),
    '2026-10-15',
    now, now
  );
}
