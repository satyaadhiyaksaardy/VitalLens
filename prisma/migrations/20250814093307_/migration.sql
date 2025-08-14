-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eatenAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT,
    "mealType" TEXT,
    "foodItems" TEXT NOT NULL,
    "totalCalories" INTEGER,
    "macros" TEXT,
    "analysis" TEXT,
    "confidence" REAL,
    "imageUrl" TEXT NOT NULL,
    CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Meal_eatenAt_idx" ON "Meal"("eatenAt");

-- CreateIndex
CREATE INDEX "Meal_userId_idx" ON "Meal"("userId");

-- CreateIndex
CREATE INDEX "Meal_mealType_idx" ON "Meal"("mealType");
