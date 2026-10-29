const test = require('node:test');
const assert = require('node:assert');
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

test('SQLite Database: initializes schema and enforces relational constraints', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL
    );
    CREATE TABLE sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.prepare('INSERT INTO users (id, username) VALUES (?, ?)').run('usr_1', 'admin');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run('tok_1', 'usr_1');

  const session = db.prepare('SELECT * FROM sessions WHERE token = ?').get('tok_1');
  assert.strictEqual(session.user_id, 'usr_1');

  // Cascade delete
  db.prepare('DELETE FROM users WHERE id = ?').run('usr_1');
  const sessionAfter = db.prepare('SELECT * FROM sessions WHERE token = ?').get('tok_1');
  assert.strictEqual(sessionAfter, undefined, 'Session must cascade delete when user is deleted');
});

test('SQLite Database: persistent database file contains all required application tables', () => {
  const dbPath = path.join(process.cwd(), 'data', 'platform.db');
  const db = new DatabaseSync(dbPath);

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(t => t.name);

  const requiredTables = [
    'settings',
    'users',
    'sessions',
    'posts',
    'projects',
    'services',
    'principles',
    'interests',
    'buying_guides',
    'enquiries',
    'orders',
    'media',
    'audit_logs'
  ];

  for (const table of requiredTables) {
    assert.strictEqual(tables.includes(table), true, `Table '${table}' must exist in platform.db`);
  }
});
