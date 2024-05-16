/*
  Warnings:

  - The required column `uuid` was added to the `FeatureSlice` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uuid` was added to the `Feature` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeatureSlice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "coordinates" TEXT NOT NULL,
    "featureId" INTEGER NOT NULL,
    CONSTRAINT "FeatureSlice_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FeatureSlice" ("coordinates", "createdAt", "endYear", "featureId", "id", "startYear", "updatedAt") SELECT "coordinates", "createdAt", "endYear", "featureId", "id", "startYear", "updatedAt" FROM "FeatureSlice";
DROP TABLE "FeatureSlice";
ALTER TABLE "new_FeatureSlice" RENAME TO "FeatureSlice";
CREATE UNIQUE INDEX "FeatureSlice_uuid_key" ON "FeatureSlice"("uuid");
CREATE TABLE "new_Feature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Unknown Feature',
    "type" TEXT NOT NULL DEFAULT 'marker',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Feature" ("createdAt", "id", "title", "type", "updatedAt") SELECT "createdAt", "id", "title", "type", "updatedAt" FROM "Feature";
DROP TABLE "Feature";
ALTER TABLE "new_Feature" RENAME TO "Feature";
CREATE UNIQUE INDEX "Feature_uuid_key" ON "Feature"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
