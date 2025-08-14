-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "measuredAt" DATETIME NOT NULL,
    "heightCm" REAL,
    "weightKg" REAL,
    "bmi" REAL,
    "standardWeightKg" REAL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "pulse" INTEGER,
    "sourceImages" TEXT NOT NULL,
    "notes" TEXT
);

-- CreateIndex
CREATE INDEX "Reading_measuredAt_idx" ON "Reading"("measuredAt");