-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "schoolName" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "slogan" TEXT,
    "adminName" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "logoBase64" TEXT NOT NULL,
    "adminImageBase64" TEXT NOT NULL,
    "transportFeeBelow3" REAL,
    "transportFeeBetween3and5" REAL,
    "transportFeeBetween5and10" REAL,
    "transportFeeAbove10" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Class" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tuitionFee" REAL NOT NULL,
    "admissionFee" REAL NOT NULL,
    "settingId" INTEGER NOT NULL,
    CONSTRAINT "Class_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "Setting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_schoolId_key" ON "Setting"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_adminEmail_key" ON "Setting"("adminEmail");
