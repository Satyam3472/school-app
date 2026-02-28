import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
const bcryptjs = require('bcryptjs');
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

// ── Resolve DB path ──────────────────────────────────────────────────────────
const rawUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const rawPath = rawUrl.replace(/^file:/, '');
const dbPath = path.isAbsolute(rawPath) ? rawPath : path.resolve('/app', rawPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create ALL tables ────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS "User" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "role"      TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

  CREATE TABLE IF NOT EXISTS "Setting" (
    "id"                       INTEGER PRIMARY KEY AUTOINCREMENT,
    "schoolName"               TEXT NOT NULL,
    "schoolId"                 TEXT NOT NULL,
    "slogan"                   TEXT,
    "adminName"                TEXT NOT NULL,
    "adminEmail"               TEXT NOT NULL,
    "password"                 TEXT NOT NULL,
    "logoBase64"               TEXT NOT NULL DEFAULT '',
    "adminImageBase64"         TEXT NOT NULL DEFAULT '',
    "transportFeeBelow3"       REAL,
    "transportFeeBetween3and5" REAL,
    "transportFeeBetween5and10" REAL,
    "transportFeeAbove10"      REAL,
    "createdAt"                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE UNIQUE INDEX IF NOT EXISTS "Setting_schoolId_key" ON "Setting"("schoolId");
  CREATE UNIQUE INDEX IF NOT EXISTS "Setting_adminEmail_key" ON "Setting"("adminEmail");

  CREATE TABLE IF NOT EXISTS "Class" (
    "id"           INTEGER PRIMARY KEY AUTOINCREMENT,
    "name"         TEXT NOT NULL,
    "tuitionFee"   REAL NOT NULL,
    "admissionFee" REAL NOT NULL,
    "settingId"    INTEGER NOT NULL,
    CONSTRAINT "Class_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "Setting"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Expense" (
    "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "category"    TEXT NOT NULL,
    "amount"      REAL NOT NULL,
    "expenseDate" DATETIME NOT NULL,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Student" (
    "id"                 INTEGER PRIMARY KEY AUTOINCREMENT,
    "studentName"        TEXT NOT NULL,
    "dateOfBirth"        DATETIME NOT NULL,
    "gender"             TEXT NOT NULL,
    "email"              TEXT,
    "phone"              TEXT NOT NULL,
    "address"            TEXT NOT NULL,
    "fatherName"         TEXT,
    "motherName"         TEXT,
    "aadhaarNumber"      TEXT,
    "regNo"              TEXT,
    "studentPhotoBase64" TEXT,
    "isActive"           BOOLEAN NOT NULL DEFAULT true,
    "createdAt"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE UNIQUE INDEX IF NOT EXISTS "Student_email_key" ON "Student"("email");

  CREATE TABLE IF NOT EXISTS "Admission" (
    "id"            INTEGER PRIMARY KEY AUTOINCREMENT,
    "studentId"     INTEGER NOT NULL,
    "admissionDate" DATETIME NOT NULL,
    "classEnrolled" TEXT NOT NULL,
    "section"       TEXT NOT NULL,
    "academicYear"  TEXT NOT NULL,
    "remarks"       TEXT,
    "transportType" TEXT NOT NULL DEFAULT 'None',
    "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Admission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS "Admission_studentId_key" ON "Admission"("studentId");

  CREATE TABLE IF NOT EXISTS "MonthlyFee" (
    "id"           INTEGER PRIMARY KEY AUTOINCREMENT,
    "studentId"    INTEGER NOT NULL,
    "month"        INTEGER NOT NULL,
    "year"         INTEGER NOT NULL,
    "tuitionFee"   REAL NOT NULL,
    "admissionFee" REAL NOT NULL,
    "totalAmount"  REAL NOT NULL,
    "paidAmount"   REAL NOT NULL DEFAULT 0,
    "dueDate"      DATETIME NOT NULL,
    "paidDate"     DATETIME,
    "status"       TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonthlyFee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS "MonthlyFee_studentId_month_year_key" ON "MonthlyFee"("studentId", "month", "year");
`);

console.log('[seed] All tables created.');

// ── Seed super admin user ────────────────────────────────────────────────────
const adminEmail = 'kumarsatyam8298380149@gmail.com';
const existingUser = db.prepare('SELECT id FROM "User" WHERE email = ?').get(adminEmail);

if (!existingUser) {
  const salt = bcryptjs.genSaltSync(10);
  const hashedPassword = bcryptjs.hashSync('Satyam@123', salt);
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO "User" (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, 'Kumar Satyam', adminEmail, hashedPassword, 'SUPER_ADMIN', now, now);
  console.log('[seed] Super admin created:', adminEmail);
} else {
  console.log('[seed] Super admin already exists.');
}

// ── Seed school settings ─────────────────────────────────────────────────────
const existingSetting = db.prepare('SELECT id FROM "Setting" WHERE "schoolId" = ?').get('KLS-2025');

if (!existingSetting) {
  const now = new Date().toISOString();

  const insertSetting = db.prepare(`
    INSERT INTO "Setting" (
      "schoolName", "schoolId", "slogan", "adminName", "adminEmail", "password",
      "logoBase64", "adminImageBase64",
      "transportFeeBelow3", "transportFeeBetween3and5",
      "transportFeeBetween5and10", "transportFeeAbove10",
      "createdAt", "updatedAt"
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSetting.run(
    'KIDS LIFE SCHOOL',    // schoolName
    'KLS-2025',            // schoolId
    'Nurturing Minds, Building Futures', // slogan
    'Kumar Satyam',        // adminName
    adminEmail,            // adminEmail
    'Satyam@123',          // password (plain — displayed in settings page)
    '',                    // logoBase64 (empty by default)
    '',                    // adminImageBase64
    500,                   // transportFeeBelow3
    700,                   // transportFeeBetween3and5
    1000,                  // transportFeeBetween5and10
    1500,                  // transportFeeAbove10
    now,                   // createdAt
    now                    // updatedAt
  );

  // Get the setting id
  const setting = db.prepare('SELECT id FROM "Setting" WHERE "schoolId" = ?').get('KLS-2025');

  // Seed default classes
  const insertClass = db.prepare(
    'INSERT INTO "Class" ("name", "tuitionFee", "admissionFee", "settingId") VALUES (?, ?, ?, ?)'
  );

  const classes = [
    { name: 'Nursery', tuitionFee: 400, admissionFee: 200 },
    { name: 'LKG', tuitionFee: 500, admissionFee: 300 },
    { name: 'UKG', tuitionFee: 500, admissionFee: 300 },
    { name: 'Class 1', tuitionFee: 600, admissionFee: 400 },
    { name: 'Class 2', tuitionFee: 600, admissionFee: 400 },
    { name: 'Class 3', tuitionFee: 700, admissionFee: 500 },
    { name: 'Class 4', tuitionFee: 700, admissionFee: 500 },
    { name: 'Class 5', tuitionFee: 800, admissionFee: 600 },
  ];

  for (const cls of classes) {
    insertClass.run(cls.name, cls.tuitionFee, cls.admissionFee, setting.id);
  }

  console.log('[seed] School settings created: KIDS LIFE SCHOOL');
  console.log('[seed] Classes seeded:', classes.map(c => c.name).join(', '));
} else {
  console.log('[seed] School settings already exist.');
}

// ── Prisma migration bookkeeping ─────────────────────────────────────────────
// Create the _prisma_migrations table so Prisma knows the schema is up to date
db.exec(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT NOT NULL PRIMARY KEY,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count"   INTEGER NOT NULL DEFAULT 0
  );
`);

console.log('[seed] Database initialization complete!');
db.close();
