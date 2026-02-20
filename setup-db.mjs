// setup-db.mjs - Creates tables and seeds super admin user directly via SQLite
// Run with: node setup-db.mjs  OR  npm run db:seed

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcryptjs = require('bcryptjs');
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

// Must match DATABASE_URL in .env (relative to project root)
const db = new Database('./prisma/dev.db');

// Create the User table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS "User" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "email"     TEXT NOT NULL UNIQUE,
    "password"  TEXT NOT NULL,
    "role"      TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ User table ready.');

const email = 'kumarsatyam8298380149@gmail.com';
const existing = db.prepare('SELECT id FROM "User" WHERE email = ?').get(email);

if (existing) {
  console.log('ℹ️  Super admin already exists:', email);
  db.close();
  process.exit(0);
}

const salt = bcryptjs.genSaltSync(10);
const hashedPassword = bcryptjs.hashSync('Satyam@123', salt);
const id = randomUUID();
const now = new Date().toISOString();

db.prepare(
  'INSERT INTO "User" (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
).run(id, 'Kumar Satyam', email, hashedPassword, 'SUPER_ADMIN', now, now);

console.log('✅ Super admin created!');
console.log('   Email:', email);
console.log('   Password: Satyam@123');
console.log('   Role: SUPER_ADMIN');
db.close();
